"""Extract reviewed sample selections from frozen print PDFs using semantic anchors.
Run in the manuscript repository's pinned Nix environment. Never rebuild books.
"""
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import unicodedata
from pypdf import PdfReader, PdfWriter


def normalize(text):
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', text).translate(str.maketrans({'\u2014': '-', '\u2013': '-', '\u2019': "'"}))).strip()


def select_pages(texts, headings):
    selected = []
    for anchors in headings:
        matches = [i for i, text in enumerate(texts) if all(re.search(r'(?<!\w)' + re.escape(normalize(a)) + r'(?!\w)', normalize(text)) for a in anchors)]
        if len(matches) != 1:
            raise ValueError(f'Expected one page for {anchors}, found {len(matches)}. Review selection; no assets replaced.')
        selected.append(matches[0])
    if len(set(selected)) != len(selected):
        raise ValueError('Selections resolve to the same page')
    return selected


def extract_isbn(text):
    matches = re.findall(r'ISBN(?:-13)?\s*:?\s*((?:[0-9][ -]?){12}[0-9])(?![0-9])', normalize(text), re.I)
    values = {re.sub(r'[^0-9]', '', value) for value in matches}
    if len(values) != 1:
        raise ValueError('Expected one ISBN-13 on the copyright page')
    isbn = values.pop()
    if not isbn.startswith(('978', '979')) or sum(int(n) * (1 if i % 2 == 0 else 3) for i, n in enumerate(isbn)) % 10:
        raise ValueError('Invalid ISBN-13 checksum or prefix')
    return isbn


def export(config, key, out):
    spec = config[key]
    source = Path(spec['source'])
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    reader = PdfReader(source)
    keywords = (reader.metadata or {}).get('/Keywords', '')
    revision = re.search(r'MathPubSourceCommit:([a-f0-9]{40})', keywords)
    assert revision and 'MathPubSourceStatus:clean' in keywords, 'Expected a clean MathPub print export'
    assert all(not p.get('/Annots') for p in reader.pages), 'Print export still has annotations'
    receipt = json.loads((source.parent / 'manifest.json').read_text())
    entry = next((e for e in receipt['files'] if e['pdf'] == str(source)), None)
    assert entry, 'Print PDF missing from export receipt'
    assert entry['sha256'] == digest and entry['pages'] == len(reader.pages), 'Print receipt mismatch'
    assert entry['source_commit'] == revision[1] and entry['page_content_unchanged']
    assert entry['annotations'] == 0
    texts = subprocess.check_output(['pdftotext', '-layout', str(source), '-'], text=True).split('\f')[:len(reader.pages)]
    assert all(normalize(t).lower() in normalize(texts[0]).lower() for t in spec['identity']), 'Print title does not match selected book'
    assert all(abs(float(p.mediabox.width)-72*spec['trim'][0]) < .01 and abs(float(p.mediabox.height)-72*spec['trim'][1]) < .01 for p in reader.pages), 'Unexpected print trim dimensions'
    isbn = extract_isbn(texts[1])
    selected = select_pages(texts, spec['headings'])
    assert not spec.get('adjacent') or selected[1] == selected[0] + 1, 'Spread is no longer adjacent; review selection'
    excerpt = PdfWriter()
    pages = []
    for n, index in enumerate(selected, 1):
        page = reader.pages[index]
        assert not page.get('/Rotate', 0)
        first_line = next(line.strip() for line in texts[index].splitlines() if line.strip())
        label = re.search(r'^(\d+)\s|\s(\d+)$', first_line)
        assert label, f'Cannot identify printed page from {first_line!r}'
        printed = next(g for g in label.groups() if g)
        excerpt.add_page(page)
        prefix = out / f'{key}-page-{n}'
        subprocess.run(['pdftoppm', '-f', str(index+1), '-l', str(index+1), '-scale-to-x', '1600', '-scale-to-y', '-1', '-singlefile', '-png', str(source), str(prefix)], check=True, stdout=subprocess.DEVNULL)
        pages.append({'image':f'{key}-page-{n}', 'label': f'Page {printed}: {spec["labels"][n-1]}', 'alt': f'{spec["title"]}, printed page {printed}: {spec["labels"][n-1]}. Read the sample description below for context.', 'width':640, 'height':round(640*float(page.mediabox.height)/float(page.mediabox.width)), 'pdfPage':index+1, 'printedPage':printed})
    excerpt.add_metadata({'/Title': spec['title'] + ': Sample pages', '/Author':'Alex Nicolaou'})
    excerpt.write(out / f'{key}-sample.pdf')
    spread = {'title':spec['heading'], 'description':spec['description'], 'caption':'Print manuscript / Pages ' + ' and '.join(p['printedPage'] for p in pages) + ' / Content may change before publication.', 'pdf':f'/assets/samples/{key}-sample.pdf', 'pages':pages, 'explanation':spec['explanation']}
    (out / f'{key}.json').write_text(json.dumps({'schema':1,'isbn':isbn,'source':str(source),'sourceSha256':digest,'sourceRevision':revision[1],'receiptVerified':bool(entry),'selectionSha256':hashlib.sha256(json.dumps(spec,sort_keys=True,separators=(',', ':')).encode()).hexdigest(),'spread':spread},indent=2)+'\n')
    print(key + ': selected PDF pages ' + ', '.join(str(i+1) for i in selected))

if __name__ == '__main__':
    config = json.loads(Path(sys.argv[1]).read_text())
    export(config, sys.argv[2], Path(sys.argv[3]))

"""Read a validated MathPub cover wrap and export its trimmed front panel.

Run through the source repository's Nix environment; never rebuild the book.
"""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
from pypdf import PdfReader, PdfWriter

sys.path.insert(0, str(Path.cwd()))
sys.path.insert(0, str(Path.cwd() / 'tools'))

out = Path(sys.argv[1])
key = sys.argv[2]
if len(sys.argv) > 3 and sys.argv[3] == 'review' and key in ('candidates-done', 'start-here', 'practice-xwing'):
    publication = f'{key}-cover'
    folder = Path('build') / publication / 'review'
    pdf = folder / f'{publication}-review-student.pdf'
    manifest = json.loads((folder / 'manifest.json').read_text())
    assert manifest['publication_id'] == publication and manifest['variant'] == 'review'
    output = next(o for o in manifest['outputs'] if o['path'] == pdf.name)
    assert output['projection'] == 'student' and output['pages'] == 1
    assert hashlib.sha256(pdf.read_bytes()).hexdigest() == output['sha256'], 'Review PDF does not match build manifest'
    assert not any(c['id'] == 'cover-dimension-guides' for c in manifest['components'])
    generated = (folder / 'generated-tex' / (pdf.stem + '.tex')).read_text()
    component = Path(f'components/examples/{publication}/body.tex').read_text()
    assert component.strip() in generated, 'Review cover artwork is stale'
    for path, digest in manifest['source']['style_sources'].items():
        assert hashlib.sha256(Path(path).read_bytes()).hexdigest() == digest, f'Review cover style is stale: {path}'
    dims = json.loads((Path(key.replace('-', '_')) / 'cover-dimensions.json').read_text())
    source = {
        'publication': publication,
        'variant': 'review',
        'sourceRevision': manifest['source']['git_commit'],
        'sourceDirty': manifest['source']['dirty'],
        'sourcePdfSha256': output['sha256'],
        'sourceExport': str(pdf),
    }
elif len(sys.argv) <= 3 or sys.argv[3] != 'review':
    # Print exports are frozen artifacts; verify the paired export receipt rather
    # than requiring a newer working manuscript to match an approved print file.
    from tools.cover_common import dimensions
    publication = 'learners-guide-cover' if key == 'guide' else f'{key}-cover'
    folder = Path('print') / ('learners-guide' if key == 'guide' else key)
    manifest = json.loads((folder / 'manifest.json').read_text())
    pdf = folder / 'cover.pdf'
    interior = folder / 'interior.pdf'
    entries = []
    for path in (pdf, interior):
        entry = next(e for e in manifest['files'] if e['pdf'] == str(path))
        assert hashlib.sha256(path.read_bytes()).hexdigest() == entry['sha256'], 'Print file does not match export receipt'
        assert entry['page_content_unchanged'] and entry['annotations'] == 0
        reader = PdfReader(path)
        assert len(reader.pages) == entry['pages']
        assert all(not p.get('/Annots') for p in reader.pages)
        keywords = (reader.metadata or {}).get('/Keywords', '')
        assert f"MathPubSourceCommit:{entry['source_commit']}" in keywords
        assert 'MathPubSourceStatus:clean' in keywords
        entries.append(entry)
    assert entries[0]['source_commit'] == entries[1]['source_commit'], 'Mismatched print cover/interior'
    interior_reader = PdfReader(interior)
    width, height = (6, 9) if key == 'guide' else (8, 10)
    assert all(abs(float(p.mediabox.width)-72*width)<.01 and abs(float(p.mediabox.height)-72*height)<.01 for p in interior_reader.pages)
    dims = dimensions(len(interior_reader.pages), width, height, 'standard-color-white' if key == 'guide' else 'black-white')
    source = {
        'publication': publication,
        'variant': 'print',
        'sourceRevision': entries[0]['source_commit'],
        'sourceDirty': False,
        'sourcePdfSha256': entries[0]['sha256'],
        'sourceExport': str(pdf),
    }
else:
    publication = {'guide': 'learners-guide-cover', 'advent-2026': 'advent-2026-cover'}[key]
    folder = Path('build') / publication / 'review'
    pdf = folder / f'{publication}-review-student.pdf'
    manifest = json.loads((folder / 'manifest.json').read_text())
    assert manifest['publication_id'] == publication
    assert manifest['variant'] == 'review'
    output = next(o for o in manifest['outputs'] if o['path'] == pdf.name)
    assert output['projection'] == 'student' and output['pages'] == 1
    assert hashlib.sha256(pdf.read_bytes()).hexdigest() == output['sha256'], 'PDF does not match successful build manifest'
    sizing_name = 'learners-guide-cover' if key == 'guide' else publication
    record = json.loads(Path(f'covers/{sizing_name}-sizing.json').read_text())
    dims = record['dimensions']
    if key == 'guide':
        from check_cover import check
        check('covers/learners-guide.toml', pdf)
    else:
        from tools.advent.cover import editorial_fingerprint
        from tools.advent.example import cover_motif_tex
        from tools.cover_common import dimensions, cover_body
        from tools.advent.sudoku import C
        interior = Path(record['interior_pdf'])
        reader = PdfReader(interior)
        assert all(abs(float(p.mediabox.width)-576)<.01 and abs(float(p.mediabox.height)-720)<.01 for p in reader.pages)
        assert dims == dimensions(len(reader.pages), 8, 10, 'black-white'), 'Stale cover sizing'
        text = subprocess.check_output(['pdftotext', str(interior), '-'], text=True)
        assert editorial_fingerprint(text) == record['interior_text_sha256'], 'Stale cover interior'
        edition = Path(record['edition'])
        annual = json.loads((edition / 'manifest.json').read_text())
        assert annual['art_sha256'] == record['art_sha256']
        day = json.loads((edition / 'day-01.json').read_text())
        puzzle, solution = day['sudoku']['puzzle'], day['sudoku']['solution']
        assert puzzle == record['puzzle'] and C['legal'](puzzle) and C['complete_solution'](solution) and C['givens_match'](puzzle, solution) and C['count_solutions'](puzzle) == 1
        cfg = json.loads(Path(f'covers/{publication}-copy.json').read_text())
        body = r'\renewcommand{\AdventCoverMotif}{' + '\n' + cover_motif_tex() + '}\n' + cover_body(cfg, dims, puzzle, record['interior_text_sha256'])
        component = Path(f'components/examples/{publication}/body.tex').read_text()
        assert body.strip() == component.strip(), 'Stale prepared cover'
        generated = (folder / 'generated-tex' / (pdf.stem + '.tex')).read_text()
        assert component.strip() in generated, 'Stale rendered cover'
        assert Path('styles/discovery-cover/style.tex').read_text().strip() in generated, 'Stale cover style'
        assert not any(c['id'] == 'cover-dimension-guides' for c in manifest['components']), 'Proof guides are not website artwork'

    source = {
        'publication': publication,
        'variant': 'review',
        'sourceRevision': manifest['source']['git_commit'],
        'sourceDirty': manifest['source']['dirty'],
        'sourcePdfSha256': output['sha256'],
    }

w, h, b, s = (float(dims[k]) for k in ('trim_width', 'trim_height', 'bleed', 'spine'))
assert abs(float(dims['width']) - (2*w + s + 2*b)) < .00001
assert abs(float(dims['height']) - (h + 2*b)) < .00001
crop = [72*(b+w+s), 72*b, 72*(b+2*w+s), 72*(b+h)]
reader = PdfReader(pdf)
assert len(reader.pages) == 1
page = reader.pages[0]
assert not page.get('/Rotate', 0)
assert abs(float(page.mediabox.width) - float(dims['width'])*72) < .003
assert abs(float(page.mediabox.height) - float(dims['height'])*72) < .003
assert list(page.mediabox.lower_left) == [0, 0]
page.cropbox.lower_left = crop[:2]
page.cropbox.upper_right = crop[2:]
writer = PdfWriter()
writer.add_page(page)
writer.write(out / 'front.pdf')
subprocess.run(['pdftoppm', '-cropbox', '-scale-to-x', '1800', '-scale-to-y', str(round(1800*h/w)), '-singlefile', '-png', str(out / 'front.pdf'), str(out / 'front')], check=True)
(out / 'source.json').write_text(json.dumps({
    **source,
    'cropPoints': crop,
    'trimInches': [w, h],
}, indent=2) + '\n')

"""Read a validated MathPub Guide wrap and export its trimmed front panel.

Run through the source repository's Nix environment; never rebuild the book.
"""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
from pypdf import PdfReader, PdfWriter

sys.path.insert(0, str(Path.cwd() / 'tools'))
from check_cover import check

out = Path(sys.argv[1])
publication = 'learners-guide-cover'
folder = Path('build') / publication / 'review'
pdf = folder / f'{publication}-review-student.pdf'
manifest = json.loads((folder / 'manifest.json').read_text())
assert manifest['publication_id'] == publication
assert manifest['variant'] == 'review'
output = next(o for o in manifest['outputs'] if o['path'] == pdf.name)
assert output['projection'] == 'student' and output['pages'] == 1
assert hashlib.sha256(pdf.read_bytes()).hexdigest() == output['sha256'], 'PDF does not match successful build manifest'
check('covers/learners-guide.toml', pdf)
dims = json.loads(Path('covers/learners-guide-cover-sizing.json').read_text())['dimensions']
w, h, b, s = (float(dims[k]) for k in ('trim_width', 'trim_height', 'bleed', 'spine'))
assert abs(float(dims['width']) - (2*w + s + 2*b)) < .00001
assert abs(float(dims['height']) - (h + 2*b)) < .00001
crop = [72*(b+w+s), 72*b, 72*(b+2*w+s), 72*(b+h)]
page = PdfReader(pdf).pages[0]
assert list(page.mediabox.lower_left) == [0, 0]
page.cropbox.lower_left = crop[:2]
page.cropbox.upper_right = crop[2:]
writer = PdfWriter()
writer.add_page(page)
writer.write(out / 'front.pdf')
subprocess.run(['pdftoppm', '-cropbox', '-scale-to-x', '1800', '-scale-to-y', '-1', '-singlefile', '-png', str(out / 'front.pdf'), str(out / 'front')], check=True)
(out / 'source.json').write_text(json.dumps({
    'publication': publication,
    'variant': 'review',
    'sourceRevision': manifest['source']['git_commit'],
    'sourceDirty': manifest['source']['dirty'],
    'sourcePdfSha256': output['sha256'],
    'cropPoints': crop,
    'trimInches': [w, h],
}, indent=2) + '\n')

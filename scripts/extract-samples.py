"""Extract only the selected public excerpt from the local review manuscript.

Requires PyMuPDF (pip install pymupdf) and npm ci.
Run: python scripts/extract-samples.py [path/to/review.pdf]
The normal website build uses the committed excerpts and does not require Python.
"""
from pathlib import Path
import subprocess
import sys
import tempfile
import fitz

root = Path(__file__).resolve().parent.parent
source = Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'sample_covers/SudokuV1.0.review.pdf'
out = root / 'public/assets/samples'
out.mkdir(parents=True, exist_ok=True)
source_doc = fitz.open(source)
excerpt = fitz.open()
for pdf_page, printed_page in [(86, 82), (87, 83)]:
    page = source_doc[pdf_page - 1]
    assert 'X-Wing' in page.get_text(), 'Review manuscript pagination changed; inspect before extraction.'
    excerpt.insert_pdf(source_doc, from_page=pdf_page - 1, to_page=pdf_page - 1, links=False, annots=False)
    with tempfile.TemporaryDirectory(prefix='annasdad-sample-') as tmp:
        png = Path(tmp) / 'page.png'
        page.get_pixmap(matrix=fitz.Matrix(3, 3), alpha=False).save(png)
        subprocess.run(['node', '--input-type=module', '-e', '''
import sharp from 'sharp';
const [input, output, page] = process.argv.slice(1);
for (const width of [640, 1280]) {
  await sharp(input).resize(width).webp({quality: 92}).toFile(`${output}/guide-x-wing-${page}-${width}.webp`);
}
''', str(png), str(out), str(printed_page)], cwd=root, check=True)
excerpt.set_metadata({'title': 'The Sudoku Learner\'s Guide: Draft sample, pages 82-83', 'author': 'Alex Nicolaou', 'subject': 'X-Wing: recognise the pattern, eliminate a candidate, and place a digit.'})
excerpt.save(out / 'sudoku-learners-guide-x-wing-sample.pdf', garbage=4, deflate=True)
print('Extracted printed pages 82-83 only; the full manuscript stays local.')

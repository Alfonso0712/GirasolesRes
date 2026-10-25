import glob

for f in sorted(glob.glob(r'e:\Downloads\GirasolesRes\analisis\docs_md\Anexo_CUS05*.md')):
    with open(f, encoding='utf-8') as fp:
        lines = fp.readlines()
    for i, l in enumerate(lines):
        if 'capacidad' in l.lower() or 'personas' in l.lower():
            print(f"{i+1}: {l.strip()[:100]}")

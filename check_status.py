
import pandas as pd
import os

file_path = r'c:\Users\maicon.bahls\Cocal\Recursos Humanos - PRIVADO\PROGRAMAS - MAICON\PHYTON\SISTEMA_BOLSAS_DEESTUDOS\BASES.BOLSAS\PROGRAMA.BOLSAS.ESTUDOS.BASE.xlsx'

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    exit()

try:
    df = pd.read_excel(file_path)
    if 'SITUACAO' in df.columns:
        print("Unique values in SITUACAO:")
        print(df['SITUACAO'].unique())
    else:
        # Try finding a similar name
        cols = [c for c in df.columns if 'SIT' in c.upper()]
        if cols:
            print(f"Unique values in {cols[0]}:")
            print(df[cols[0]].unique())
        else:
            print("SITUACAO column not found. Columns are:")
            print(df.columns.tolist())
    
except Exception as e:
    print(f"Error: {e}")

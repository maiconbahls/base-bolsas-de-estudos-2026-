
import pandas as pd
import os

file_path = r'C:\Users\maicon.bahls\Cocal\Recursos Humanos - PRIVADO\PROGRAMAS - MAICON\PHYTON\SISTEMA_BOLSAS_DEESTUDOS\BASES.BOLSAS\PROGRAMA.BOLSAS.ESTUDOS.BASE.xlsx'

try:
    if os.path.exists(file_path):
        df = pd.read_excel(file_path)
        print("Columns:", df.columns.tolist())
        if 'SITUACAO' in df.columns:
            print("\nUnique SITUACAO values:")
            print(df['SITUACAO'].unique().tolist())
        if 'CHECAGEM' in df.columns:
            print("\nUnique CHECAGEM values:")
            print(df['CHECAGEM'].unique().tolist())
    else:
        print(f"File not found: {file_path}")
except Exception as e:
    print(f"Error: {e}")


import pandas as pd
import os

file_path = r'c:\Users\maicon.bahls\Cocal\Recursos Humanos - PRIVADO\PROGRAMAS - MAICON\PHYTON\SISTEMA_BOLSAS_DEESTUDOS\BASES.BOLSAS\PROGRAMA.BOLSAS.ESTUDOS.BASE.xlsx'

try:
    df = pd.read_excel(file_path)
    if 'CHECAGEM' in df.columns:
        print("Value counts for CHECAGEM:")
        print(df['CHECAGEM'].value_counts(dropna=False))
except Exception as e:
    print(e)

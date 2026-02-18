
import pandas as pd
import os

file_path = r'c:\Users\maicon.bahls\Cocal\Recursos Humanos - PRIVADO\PROGRAMAS - MAICON\PHYTON\SISTEMA_BOLSAS_DEESTUDOS\BASES.BOLSAS\PROGRAMA.BOLSAS.ESTUDOS.BASE.xlsx'

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    exit()

try:
    df = pd.read_excel(file_path)
    print("HEADERS:")
    for col in df.columns:
        print(f"'{col}'")
    
    print("\nFIRST ROW:")
    print(df.iloc[0].to_dict())
    
except Exception as e:
    print(f"Error reading excel: {e}")


import pandas as pd
file_path = r'C:\Users\maicon.bahls\Cocal\Recursos Humanos - PRIVADO\PROGRAMAS - MAICON\PHYTON\SISTEMA_BOLSAS_DEESTUDOS\BASES.BOLSAS\PROGRAMA.BOLSAS.ESTUDOS.BASE.xlsx'
df = pd.read_excel(file_path)
print("SITUACAO counts:")
print(df['SITUACAO'].value_counts())
print("\nCHECAGEM counts:")
print(df['CHECAGEM'].value_counts())

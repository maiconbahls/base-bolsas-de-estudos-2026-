
import pandas as pd
import os
import shutil

src = r'C:\Users\maicon.bahls\Cocal\Recursos Humanos - PRIVADO\PROGRAMAS - MAICON\PHYTON\SISTEMA_BOLSAS_DEESTUDOS\BASES.BOLSAS\BASE.PAGAMENTOS.xlsx'
dst = 'temp_pagamentos.xlsx'

try:
    if os.path.exists(src):
        shutil.copy2(src, dst)
        xl = pd.ExcelFile(dst)
        print("Sheet Names:", xl.sheet_names)
        
        total_sum = 0
        total_count = 0
        
        for sheet in xl.sheet_names:
            df = xl.parse(sheet)
            print(f"\nAnalyzing sheet: {sheet}")
            
            # Find a column that looks like repayment value
            val_col = None
            for col in df.columns:
                c_norm = str(col).upper()
                if 'VALOR_REEMBOLSO' in c_norm or 'VALOR_P' in c_norm or 'VALOR' in c_norm:
                    val_col = col
                    break
            
            if val_col:
                # Clean and sum
                raw_vals = df[val_col].dropna()
                def clean_val(v):
                    if isinstance(v, (int, float)): return float(v)
                    v_str = str(v).replace('R$', '').replace('.', '').replace(',', '.').strip()
                    try: return float(v_str)
                    except: return 0.0

                cleaned = raw_vals.apply(clean_val)
                s = cleaned.sum()
                c = len(cleaned[cleaned > 0])
                print(f"  Sum: {s:,.2f}")
                print(f"  Count: {c}")
                total_sum += s
                total_count += c
            else:
                print("  No value column found.")
                
        print(f"\nTOTAL SUM: {total_sum:,.2f}")
        print(f"TOTAL COUNT: {total_count}")
        os.remove(dst)
    else:
        print(f"File not found: {src}")
except Exception as e:
    print(f"Error: {e}")
    if os.path.exists(dst): os.remove(dst)

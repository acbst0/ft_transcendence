#!/usr/bin/env python3
import os
import re

def fix_except_blocks(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    fixed_lines = []
    i = 0
    while i < len(lines):
        fixed_lines.append(lines[i])
        
        # Check if this is an except line
        if re.match(r'^(\s*)except\s+.*:\s*$', lines[i]):
            indent = len(lines[i]) - len(lines[i].lstrip())
            
            # Check next line
            if i + 1 < len(lines):
                next_line = lines[i + 1]
                next_indent = len(next_line) - len(next_line.lstrip())
                
                # If next line exists but has wrong indent or is a new statement
                if next_indent <= indent or next_line.strip() == '':
                    # Add pass statement with correct indentation
                    fixed_lines.append(' ' * (indent + 4) + 'pass\n')
        
        i += 1
    
    with open(filepath, 'w') as f:
        f.writelines(fixed_lines)

# Find all Python files
for root, dirs, files in os.walk('/app'):
    for file in files:
        if file.endswith('.py'):
            filepath = os.path.join(root, file)
            try:
                fix_except_blocks(filepath)
                print(f"Fixed: {filepath}")
            except Exception as e:
                print(f"Error fixing {filepath}: {e}")

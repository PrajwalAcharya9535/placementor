s = input().strip()
seen = set()
result = ""
for ch in s:
       if ch not in seen:
           seen.add(ch)
           result += ch
print(results)           
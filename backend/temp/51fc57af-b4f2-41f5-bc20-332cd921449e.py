s = input().strip()
seen = set()
results = ""
for ch in s:
       if ch not in seen:
           seen.add(ch)
           results += ch
print(results)           
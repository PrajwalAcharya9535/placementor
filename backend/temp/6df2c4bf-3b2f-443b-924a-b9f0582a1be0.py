s = input().strip()
seen = set()
r = ""
for ch in reversed(s):
      if ch not in seen:
          seen.add(ch)
          r = ch + r
print(r)          
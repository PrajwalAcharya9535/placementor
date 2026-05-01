import sys

raw = sys.stdin.read()
print("DEBUG RAW:", raw)

data = raw.strip().split()
print("DEBUG SPLIT:", data)

if len(data) < 2:
    print([])
    exit()

nums = list(map(int, data[:-1]))
target = int(data[-1])

for i in range(len(nums)):
    for j in range(i + 1, len(nums)):
        if nums[i] + nums[j] == target:
            print(f"[{i},{j}]")
            exit()

print([])
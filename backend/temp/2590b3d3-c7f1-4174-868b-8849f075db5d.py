import sys

data = sys.stdin.read().strip().split()

nums = list(map(int, data[:-1]))
target = int(data[-1])

for i in range(len(nums)):
    for j in range(i+1, len(nums)):
        if nums[i] + nums[j] == target:
            print(f"[{i},{j}]")
            break
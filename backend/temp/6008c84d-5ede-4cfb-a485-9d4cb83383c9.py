nums = list(map(int, input().split()))
target = int(input())

seen = {}

for i, num in enumerate(nums):
    diff = target - num
    if diff in seen:
        print(f"[{seen[diff]},{i}]", end="")
        break
    seen[num] = i
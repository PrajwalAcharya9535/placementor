nums = list(map(int, input().split()))
target = int(input())

best = None

for i in range(len(nums)):
    for j in range(i+1, len(nums)):
        if nums[i] + nums[j] == target:
            if best is None or [i, j] < best:
                best = [i, j]

print(f"[{best[0]},{best[1]}]", end="")
nums = list(map(int, input().split()))
target = int(input())

result = []

for i in range(len(nums)):
    for j in range(i+1, len(nums)):
        if nums[i] + nums[j] == target:
            result.append([i, j])

# 🔥 choose lexicographically smallest pair
result.sort()

print(f"[{result[0][0]},{result[0][1]}]", end="")
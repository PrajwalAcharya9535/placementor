# Read input
nums = list(map(int, input().split()))
target = int(input())

# Write code here
seen = {}

for i in range(len(nums)):
    complement = target - nums[i]

    if complement in seen:
        print([seen[complement], i])
        break

    seen[nums[i]] = i
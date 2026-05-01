# Read input
nums = list(map(int, input().split()))
target = int(input())

# HashMap to store value → index
seen = {}

for i in range(len(nums)):
    complement = target - nums[i]

    if complement in seen:
        print([seen[complement], i])
        break

    seen[nums[i]] = i
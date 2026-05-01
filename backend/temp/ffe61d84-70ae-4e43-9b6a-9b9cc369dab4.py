nums = list(map(int, input().strip().split()))
target = int(input().strip())

for i in range(len(nums)):
    for j in range(i+1, len(nums)):
        if nums[i] + nums[j] == target:
            print(f"[{i},{j}]")
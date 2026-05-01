# Read input
n = int(input().strip())
arr = list(map(int, input().split()))

# Find second largest
first = second = float('-inf')

for num in arr:
    if num > first:
        second = first
        first = num
    elif num > second and num != first:
        second = num

# Output result
print(second)
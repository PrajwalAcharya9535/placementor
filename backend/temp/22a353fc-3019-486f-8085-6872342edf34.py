# Find Missing Number

n = int(input())
arr = list(map(int, input().split()))

# Expected sum of 1 to n
total = n * (n + 1) // 2

# Actual sum
actual = sum(arr)

# Missing number
print(total - actual)
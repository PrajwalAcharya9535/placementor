# Find Second Largest Element

n = int(input())
arr = list(map(int, input().split()))

# Remove duplicates
arr = list(set(arr))

# Sort array
arr.sort()

# Second largest
print(arr[-2])
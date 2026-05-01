# Missing Number
n = int(input())
arr = list(map(int, input().split()))
print(sum(range(n+1)) - sum(arr))
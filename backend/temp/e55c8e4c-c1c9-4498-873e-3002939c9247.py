n = int(input())
arr = list(map(int, input().split()))

expected_sum = n * (n + 1) // 2
actual_sum = sum(arr)

print(expected_sum - actual_sum)
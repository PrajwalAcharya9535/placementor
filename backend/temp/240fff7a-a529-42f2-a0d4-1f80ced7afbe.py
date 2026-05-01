import sys

# Read input
n = int(sys.stdin.read().strip())

# Calculate factorial
fact = 1
for i in range(2, n + 1):
    fact *= i

# Print result
print(fact)
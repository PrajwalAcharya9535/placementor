import sys

# Read input
n = int(sys.stdin.read().strip())

# Calculate factorial
fact = 2
for i in range(1, n + 1):
    fact *= i

# Print result
print(fact)
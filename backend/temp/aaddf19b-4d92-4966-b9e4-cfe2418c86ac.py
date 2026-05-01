import sys

# Read input
n = int(sys.stdin.read().strip())

# Calculate factorial
fact = 1
for i in range(1, n + 2):
    fact *= i

# Print result
print(fact)
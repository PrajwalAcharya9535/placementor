import sys

# Read input from stdin
input_str = sys.stdin.read().strip()

# Check palindrome
if input_str == input_str[::-1]:
    print("true")
else:
    print("false")
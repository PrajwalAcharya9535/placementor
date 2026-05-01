def second_largest(arr):
    if len(arr) < 2:
        return None

    first = second = float('-inf')

    for num in arr:
        if num > first:
            second = first
            first = num
        elif num > second and num != first:
            second = num

    return second


# 🔥 Example
arr = [1, 2, 3, 4, 5]
print(second_largest(arr))   # Output: 4
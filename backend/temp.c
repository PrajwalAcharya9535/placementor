#include <stdio.h>

int main() {
    int nums[100], n = 0;

    // Read numbers (first line)
    while (scanf("%d", &nums[n]) == 1) {
        n++;
        if (getchar() == '\n') break;
    }

    // Read target (second line)
    int target;
    scanf("%d", &target);

    // Two Sum logic
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] == target) {
                printf("[%d,%d]", i, j); // IMPORTANT format
                return 0;
            }
        }
    }

    return 0;
}
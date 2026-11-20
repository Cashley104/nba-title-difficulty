# NBA Title Difficulty dashboard

This is an exploratory injury-availability model, not a complete measure of championship difficulty. The displayed formula documents the actual 50/50 index and nonlinear injury/minutes penalties (exponent 1.35, or 3.0 for severe injuries). These weights are modeling assumptions.

The 2024 and 2025 ratings remain provisional because injury-source fetches failed in the retained dataset. No missing injuries were invented. Current cached injury inputs contain no suspension rows, so restricting future suspension adjustments to the relevant series does not change the existing 26 ranking records. The local generating-code fix passes seven behavior tests.

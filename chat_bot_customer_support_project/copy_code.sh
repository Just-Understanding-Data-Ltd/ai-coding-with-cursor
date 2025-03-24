#!/bin/bash

# Check if directory path is provided
if [ $# -ne 1 ]; then
    echo "Usage: $0 <directory_path>"
    exit 1
fi

SEARCH_DIR="$1"

# Function to get relative path that works on macOS
get_relative_path() {
    local file="$1"
    local base="$2"
    echo "${file#$base/}"
}

# Create a temporary file for the complete output
final_output=$(mktemp)

while IFS= read -r file; do
    # Skip the script itself
    if [[ "$file" == *"copy_code.sh"* ]]; then
        continue
    fi

    # Determine the MIME type of the file
    mime_type=$(file -b --mime-type "$file")

    # Only include the file if it's a text file
    if [[ "$mime_type" == text/* ]]; then
        relative_path=$(get_relative_path "$file" "$SEARCH_DIR")

        {
            echo "### $relative_path"
            echo ''"${relative_path##*.}"
            cat "$file"
            echo ''
            echo
            echo
        } >> "$final_output"
        
        echo "Added: $relative_path"
    fi
done < <(
    find "$SEARCH_DIR" \
        -type d \( -name node_modules -o -name .git -o -name .ruff_cache -o -name .pytest_cache -o -name .next -o -name .mypy_cache \) -prune -false -o \
        -type f \
        ! -name "*.html" \
        ! -iname "*.tsbuildinfo" \
        ! -iname "*.pyc" \
        ! -iname "*.png" \
        ! -iname "*.jpg" \
        ! -iname "*.jpeg" \
        ! -iname "*.gif" \
        ! -iname "*.svg" \
        ! -iname "*.webp" \
        ! -iname "*.ico" \
        ! -iname "*.pdf" \
        ! -iname "*.docx" \
        ! -iname "*.xlsx" \
        ! -iname "*.pptx" \
        ! -name "*.js" \
        ! -name "*.d.ts" \
        -print
)

# Copy the complete output to clipboard (macOS)
cat "$final_output" | pbcopy

echo "All files have been concatenated and copied to clipboard!"

# Clean up
rm "$final_output"

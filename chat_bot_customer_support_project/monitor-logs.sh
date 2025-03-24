#!/bin/bash

# ANSI color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# RLS Issues with Context
print_header "Row Level Security (RLS) Issues with SQL Context (Last 100)"
docker logs supabase_db_cursordevkit_octospark 2>&1 | grep -i -B 1 -A 2 "row-level security\|rls" | grep -v "^--$" | tail -n 100 | while read -r line; do
    if [[ $line =~ ERROR|FATAL ]]; then
        echo -e "${RED}$line${NC}"
    else
        echo "$line"
    fi
done

# Database Performance (Slow Queries)
print_header "Slow Queries (>1000ms, Last 20)"
docker logs supabase_db_cursordevkit_octospark 2>&1 | grep -i "duration:" | grep -i "ms)" | awk '{ if ($NF > 1000) print $0 }' | tail -n 20 | while read -r line; do
    echo -e "${YELLOW}$line${NC}"
done

# Database Errors & Warnings
print_header "Database Logs (Errors & Warnings)"
docker logs supabase_db_cursordevkit_octospark --tail 50 2>&1 | grep -i "error\|warning\|notice\|fatal" | while read -r line; do
    if [[ $line =~ ERROR|FATAL ]]; then
        echo -e "${RED}$line${NC}"
    elif [[ $line =~ WARNING ]]; then
        echo -e "${YELLOW}$line${NC}"
    else
        echo -e "${GREEN}$line${NC}"
    fi
done

# Auth Service Logs
print_header "Auth Service Logs (Last 20 - Focus on Errors & Login Attempts)"
docker logs supabase_auth_cursordevkit_octospark --tail 50 2>&1 | grep -i "error\|failed\|success.*login\|token" | tail -n 20 | while read -r line; do
    if [[ $line =~ error|failed ]]; then
        echo -e "${RED}$line${NC}"
    elif [[ $line =~ success ]]; then
        echo -e "${GREEN}$line${NC}"
    else
        echo "$line"
    fi
done

# REST API Status and Errors
print_header "REST API Status and Errors"
docker logs supabase_rest_cursordevkit_octospark --tail 20 2>&1 | while read -r line; do
    if [[ $line =~ error|failed ]]; then
        echo -e "${RED}$line${NC}"
    elif [[ $line =~ warning ]]; then
        echo -e "${YELLOW}$line${NC}"
    else
        echo "$line"
    fi
done

# Realtime Service Logs
print_header "Realtime Service Status (WebSocket Events)"
docker logs supabase_realtime_cursordevkit_octospark --tail 20 2>&1 | while read -r line; do
    if [[ $line =~ error|failed ]]; then
        echo -e "${RED}$line${NC}"
    elif [[ $line =~ warning ]]; then
        echo -e "${YELLOW}$line${NC}"
    elif [[ $line =~ connected|joined ]]; then
        echo -e "${GREEN}$line${NC}"
    else
        echo "$line"
    fi
done

# Storage Service Logs
print_header "Storage Service Logs"
docker logs supabase_storage_cursordevkit_octospark --tail 20 2>&1 | while read -r line; do
    if [[ $line =~ error|failed ]]; then
        echo -e "${RED}$line${NC}"
    elif [[ $line =~ warning ]]; then
        echo -e "${YELLOW}$line${NC}"
    elif [[ $line =~ success ]]; then
        echo -e "${GREEN}$line${NC}"
    else
        echo "$line"
    fi
done
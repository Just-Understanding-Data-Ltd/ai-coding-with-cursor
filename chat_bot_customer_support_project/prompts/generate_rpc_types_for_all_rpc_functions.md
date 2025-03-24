Inside of the packages/supabase/src/database-functions.type.ts file, we manually create the types for each of the RPC functions, this is because if we are returning JSON, the types are not automatically generated.

If there are any missing types, then please generate them for me.

You will need to look in all of the files in the packages/supabase/supabase/migrations folder and generate the types for each of the RPC functions.

Always use the Args, but for the Return types you will need to manually create the types.

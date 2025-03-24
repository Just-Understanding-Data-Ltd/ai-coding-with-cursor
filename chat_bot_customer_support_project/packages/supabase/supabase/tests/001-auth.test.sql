BEGIN;
SELECT plan( 5 );

SELECT has_column('users', 'id');
SELECT has_column('users', 'email');
SELECT has_column('users', 'avatar');
SELECT has_column('users', 'created_at');
SELECT has_column('users', 'updated_at');

SELECT * FROM finish(true);
ROLLBACK;
/*
08_blog_content.sql
Insert sample authors, categories, and articles for testing blog features.
*/

/* Sample Authors */
INSERT INTO authors (id, name, bio, avatar_url) VALUES
('cc00a361-cb50-4f91-8f17-14ec2c7f6d0a', 'John Doe', 'Tech enthusiast and software engineer', 'https://example.com/john-doe-avatar.jpg'),
('9c36adc1-7fb5-4d5b-83b4-90356a46061a', 'Jane Smith', 'AI researcher and data scientist', 'https://example.com/jane-smith-avatar.jpg')
ON CONFLICT (id) DO NOTHING;

/* Sample Categories */
INSERT INTO categories (id, name, description) VALUES
(gen_random_uuid(), 'Technology', 'Latest news and trends in technology'),
(gen_random_uuid(), 'Artificial Intelligence', 'Exploring the world of AI and machine learning');

/* Sample Articles */
INSERT INTO articles (id, title, content, excerpt, author_id, category_id, featured_image) VALUES
(
    gen_random_uuid(), 
    'The Future of Web Development', 
    '<p>Web development is constantly evolving...</p>',
    'Explore the latest trends shaping the future of web development...',
    'cc00a361-cb50-4f91-8f17-14ec2c7f6d0a',
    (SELECT id FROM categories WHERE name = 'Technology'),
    'https://example.com/web-dev.jpg'
),
(
    gen_random_uuid(), 
    'Understanding Machine Learning Algorithms', 
    '<p>Machine learning is a rapidly growing field...</p>',
    'Dive into the world of machine learning...',
    '9c36adc1-7fb5-4d5b-83b4-90356a46061a',
    (SELECT id FROM categories WHERE name = 'Artificial Intelligence'),
    'https://example.com/ml.jpg'
); 
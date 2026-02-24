INSERT INTO public.jobs (title, description, company, location)
VALUES
  ('PPF Installer', 'Seeking experienced PPF installer for high-end vehicles. Must have a keen eye for detail and precision. Opportunity to work with exotic cars and a dedicated team.', 'Elite Auto Spa', 'San Francisco, CA'),
  ('Vinyl Wrap Specialist', 'Join our dynamic team as a Vinyl Wrap Specialist. We focus on custom vehicle wraps, color changes, and commercial fleet branding. Creativity and experience with various vinyl types are a plus.', 'Wrap Dynamics', 'Atlanta, GA'),
  ('Window Tint Technician', 'Experienced Window Tint Technician needed for automotive and residential tinting. Knowledge of different film types and local regulations is essential. Strong customer service skills required.', 'Clear View Tints', 'Oakland, CA'),
  ('Ceramic Coating Technician', 'We are looking for a skilled Ceramic Coating Technician to apply advanced protective coatings to vehicles. Attention to detail and a passion for automotive aesthetics are a must.', 'Shine Pro Detailing', 'Roswell, GA'),
  ('Automotive Detailer', 'Professional Automotive Detailer wanted for a busy shop. Responsibilities include interior and exterior detailing, paint correction, and customer vehicle preparation.', 'Prestige Auto Works', 'Berkeley, CA'),
  ('Lead PPF Installer', 'Lead PPF Installer position available. Manage a team, train junior installers, and ensure the highest quality PPF applications on luxury vehicles.', 'Luxury Shield Films', 'San Jose, CA'),
  ('Commercial Wrap Installer', 'Seeking a Commercial Wrap Installer for large format graphic installations on vehicles and storefronts. Experience with ladder work and precision cutting required.', 'Sign & Wrap Solutions', 'Alpharetta, GA'),
  ('Mobile Window Tint Specialist', 'Independent Mobile Window Tint Specialist needed. Provide on-site window tinting services for clients in the greater Bay Area. Flexible schedule and commission-based.', 'Bay Area Tint Pros', 'Fremont, CA'),
  ('Paint Correction & Detailer', 'Join our team as a Paint Correction & Detailer. Specializing in advanced paint correction techniques, ceramic coatings, and premium detailing services. Experience with various paint types and tools is a must.', 'Precision Auto Detail', 'Marietta, GA'),
  ('Vehicle Accessory Installer', 'Install various vehicle accessories including protective films, lighting, and custom upgrades. Must be familiar with different vehicle makes and models.', 'Custom Rides SF', 'San Francisco, CA');

INSERT INTO public.installers (name, email, location, specialties, bio, portfolio_urls, years_experience, is_available, slug, manage_token)
VALUES
  ('Marcus Hill', 'marcus.hill@example.com', 'Dallas, TX', ARRAY['vinyl-wrap','ppf'], 'Lead wrap installer specializing in matte color-change wraps and full-front PPF packages.', ARRAY['https://instagram.com/marcuswraps','https://drive.google.com/marcusportfolio'], 8, true, 'marcus-hill-dallas-tx', 'seedtoken-marcus-hill'),
  ('Elena Ortiz', 'elena.ortiz@example.com', 'Austin, TX', ARRAY['window-tint','ceramic-coating'], 'Mobile tint and coating specialist focused on premium heat-rejection films.', ARRAY['https://instagram.com/ortiztintlab'], 6, true, 'elena-ortiz-austin-tx', 'seedtoken-elena-ortiz'),
  ('Darnell Brooks', 'darnell.brooks@example.com', 'Phoenix, AZ', ARRAY['ppf','paint-correction'], 'PPF edge-wrap technician with paint correction background on high-end vehicles.', ARRAY['https://www.youtube.com/@brooksppf'], 9, false, 'darnell-brooks-phoenix-az', 'seedtoken-darnell-brooks'),
  ('Kayla Nguyen', 'kayla.nguyen@example.com', 'San Diego, CA', ARRAY['vinyl-wrap','auto-detailing'], 'Fleet wrap installer and detailer experienced with rapid turnaround commercial jobs.', ARRAY['https://instagram.com/kaylawrapworks'], 5, true, 'kayla-nguyen-san-diego-ca', 'seedtoken-kayla-nguyen'),
  ('Jordan Bell', 'jordan.bell@example.com', 'Miami, FL', ARRAY['window-tint'], 'Tint specialist focused on clean shrink patterns and compliance with state film laws.', ARRAY['https://jordanbelltint.example.com'], 4, true, 'jordan-bell-miami-fl', 'seedtoken-jordan-bell'),
  ('Isaac Romero', 'isaac.romero@example.com', 'Las Vegas, NV', ARRAY['ceramic-coating','paint-correction'], 'Correction and coating technician delivering multi-stage polishing and long-term protection.', ARRAY['https://instagram.com/romerocoatings'], 7, true, 'isaac-romero-las-vegas-nv', 'seedtoken-isaac-romero'),
  ('Nia Patel', 'nia.patel@example.com', 'Seattle, WA', ARRAY['ppf','window-tint'], 'Certified PPF installer with luxury dealership experience and in-house tint support.', ARRAY['https://instagram.com/niaprotectivefilms'], 10, false, 'nia-patel-seattle-wa', 'seedtoken-nia-patel'),
  ('Cody Ramirez', 'cody.ramirez@example.com', 'Denver, CO', ARRAY['auto-detailing','ceramic-coating'], 'Detail bay lead handling prep, decontamination, and ceramic installs.', ARRAY['https://tiktok.com/@detailcody'], 3, true, 'cody-ramirez-denver-co', 'seedtoken-cody-ramirez'),
  ('Sofia Bennett', 'sofia.bennett@example.com', 'Nashville, TN', ARRAY['vinyl-wrap','window-tint','ppf'], 'Versatile installer across wraps, tint, and PPF with strong customer handoff process.', ARRAY['https://instagram.com/sofiabuilds'], 11, true, 'sofia-bennett-nashville-tn', 'seedtoken-sofia-bennett'),
  ('Trevor King', 'trevor.king@example.com', 'Charlotte, NC', ARRAY['vinyl-wrap','paint-correction'], 'Color-change wrap specialist known for complex curves and post-wrap refinishing.', ARRAY['https://www.trevorwraps.example.com'], 12, true, 'trevor-king-charlotte-nc', 'seedtoken-trevor-king')
ON CONFLICT (slug) DO NOTHING;

UPDATE public.installers
SET
  instagram = '@marcuswraps',
  tiktok = '@marcuswraps',
  website = 'https://marcuswrapgarage.example.com',
  youtube = 'https://youtube.com/@marcuswraps',
  phone = '(214) 555-0142'
WHERE slug = 'marcus-hill-dallas-tx';

UPDATE public.installers
SET
  instagram = '@ortiztintlab',
  website = 'https://ortiztintlab.example.com',
  phone = '(512) 555-0178'
WHERE slug = 'elena-ortiz-austin-tx';

UPDATE public.installers
SET
  tiktok = '@detailcody',
  website = 'https://detailcody.example.com',
  youtube = 'https://youtube.com/@detailcody'
WHERE slug = 'cody-ramirez-denver-co';

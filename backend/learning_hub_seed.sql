-- ============================================
-- SAFE SPHERE LEARNING HUB - SEED DATA
-- ============================================

-- 1. CATEGORIES
INSERT INTO learning_categories (title, description, icon, color) VALUES
('Self Defence', 'Physical safety techniques and awareness', '🥋', '#EF4444'),
('Cyber Safety', 'Protect yourself from online threats', '💻', '#8B5CF6'),
('Women Rights', 'Know your legal rights and protections', '⚖️', '#F59E0B'),
('Emergency Response', 'First aid and crisis management', '🚑', '#DC2626'),
('Safe Travel', 'Tips for commuting and traveling safely', '🚗', '#3B82F6'),
('Digital Privacy', 'Protect your data and digital identity', '🔒', '#10B981'),
('Scam Awareness', 'Identify and avoid common scams', '🚫', '#F97316');

-- 2. LESSONS

-- === SELF DEFENCE ===
INSERT INTO lessons (category_id, title, description, content, duration, difficulty) VALUES
(
  (SELECT id FROM learning_categories WHERE title = 'Self Defence'),
  'Situational Awareness 101',
  'Learn to read your environment and spot danger before it reaches you.',
  '<h2>What is Situational Awareness?</h2><p>Situational awareness is the ability to identify, process, and comprehend critical elements of your environment. It is your <strong>first and most powerful line of defense</strong>.</p><h3>The 3 Levels</h3><ul><li><strong>Level 1 - Perception:</strong> Noticing people, exits, and unusual behavior around you.</li><li><strong>Level 2 - Comprehension:</strong> Understanding what those observations mean. Is that person following you?</li><li><strong>Level 3 - Projection:</strong> Anticipating what might happen next and planning your response.</li></ul><h3>Practical Tips</h3><ul><li>Put your phone away when walking, especially at night.</li><li>Walk with purpose and confidence - attackers target those who look distracted.</li><li>Always know where the nearest exit is in any building.</li><li>Trust your gut feeling. If something feels wrong, it probably is.</li><li>Use reflective surfaces (windows, mirrors) to check behind you.</li></ul>',
  5, 'Beginner'
),
(
  (SELECT id FROM learning_categories WHERE title = 'Self Defence'),
  'De-escalation Techniques',
  'How to calm a tense situation before it becomes physical.',
  '<h2>Why De-escalation?</h2><p>Physical confrontation should always be the <strong>last resort</strong>. De-escalation can prevent 80% of dangerous encounters.</p><h3>Key Techniques</h3><ul><li><strong>Calm Voice:</strong> Speak slowly, softly, and clearly. Never match their aggression.</li><li><strong>Open Body Language:</strong> Keep hands visible and open. Do not cross arms or point fingers.</li><li><strong>Empathy Statements:</strong> Say things like "I understand you are upset" to validate their emotions.</li><li><strong>Create Distance:</strong> Slowly back away while talking. Maintain at least 2 arm-lengths of distance.</li><li><strong>Offer Choices:</strong> "Would you like to sit down and talk?" gives them a sense of control.</li></ul><h3>When NOT to De-escalate</h3><p>If the person has a weapon, is under the influence of drugs, or has already made physical contact - <strong>do not engage</strong>. Run to a safe place immediately.</p>',
  5, 'Intermediate'
),
(
  (SELECT id FROM learning_categories WHERE title = 'Self Defence'),
  'Basic Self-Defence Moves',
  'Simple, effective physical techniques anyone can learn.',
  '<h2>Remember: Fight Only When You Must</h2><p>These techniques are for <strong>creating an opportunity to escape</strong>, not for winning a fight.</p><h3>The 3 Most Effective Moves</h3><ol><li><strong>Palm Strike to the Nose:</strong> Use the heel of your palm (not a closed fist) to strike upward at the nose. This causes watering eyes and disorientation.</li><li><strong>Knee to the Groin:</strong> If grabbed from the front, drive your knee upward with full force. This works regardless of size difference.</li><li><strong>Elbow Strike:</strong> If grabbed from behind, swing your elbow horizontally to the ribs or face. Your elbow is one of the hardest bones in your body.</li></ol><h3>After the Strike</h3><p>RUN. Do not stay to fight. Run toward light, people, and noise. Shout "FIRE!" instead of "HELP!" - studies show people respond faster to fire alarms.</p>',
  7, 'Beginner'
);

-- === CYBER SAFETY ===
INSERT INTO lessons (category_id, title, description, content, duration, difficulty) VALUES
(
  (SELECT id FROM learning_categories WHERE title = 'Cyber Safety'),
  'Strong Passwords & 2FA',
  'The foundation of your digital security.',
  '<h2>Why Passwords Matter</h2><p>81% of data breaches involve weak or stolen passwords. A strong password is your first line of digital defense.</p><h3>Password Rules</h3><ul><li><strong>Minimum 12 characters</strong> long.</li><li>Use a mix of uppercase, lowercase, numbers, and symbols.</li><li>NEVER reuse passwords across different sites.</li><li>Use a <strong>passphrase</strong> instead: "PurpleTiger$Runs42Miles!" is stronger than "P@ssw0rd".</li></ul><h3>Two-Factor Authentication (2FA)</h3><p>2FA adds a second layer. Even if someone steals your password, they cannot access your account without the second factor.</p><ul><li>Best: Authenticator apps (Google Authenticator, Authy)</li><li>Good: SMS codes (can be intercepted via SIM swap)</li><li>Avoid: Security questions (answers can be found on social media)</li></ul>',
  5, 'Beginner'
),
(
  (SELECT id FROM learning_categories WHERE title = 'Cyber Safety'),
  'Spotting Phishing Attacks',
  'How to identify fake emails, messages, and websites.',
  '<h2>What is Phishing?</h2><p>Phishing is when attackers impersonate trusted organizations to steal your personal information.</p><h3>Red Flags to Watch For</h3><ul><li><strong>Urgency:</strong> "Your account will be deleted in 24 hours!"</li><li><strong>Generic Greetings:</strong> "Dear Customer" instead of your name.</li><li><strong>Suspicious Links:</strong> Hover over links to see the real URL. "amaz0n-security.com" is NOT Amazon.</li><li><strong>Attachments:</strong> Never open unexpected attachments, especially .exe or .zip files.</li><li><strong>Too Good to Be True:</strong> "You won a $1000 gift card!"</li></ul><h3>What to Do</h3><ol><li>Do NOT click any links.</li><li>Go directly to the official website by typing the URL yourself.</li><li>Report the email as phishing/spam.</li><li>If you already clicked, change your password immediately.</li></ol>',
  5, 'Beginner'
);

-- === WOMEN RIGHTS ===
INSERT INTO lessons (category_id, title, description, content, duration, difficulty) VALUES
(
  (SELECT id FROM learning_categories WHERE title = 'Women Rights'),
  'Know Your Legal Rights',
  'Understanding laws that protect women from harassment and violence.',
  '<h2>Your Fundamental Rights</h2><p>Every woman has the right to live free from violence, harassment, and discrimination. Here are key protections:</p><h3>Workplace Harassment</h3><ul><li>Employers MUST have an Internal Complaints Committee (ICC).</li><li>You can file a complaint within 3 months of the incident.</li><li>The law covers verbal, physical, and digital harassment.</li></ul><h3>Domestic Violence</h3><ul><li>You have the right to protection orders, residence orders, and monetary relief.</li><li>Police must register an FIR for domestic violence complaints.</li><li>You can approach the court directly without a lawyer.</li></ul><h3>Stalking & Cyberstalking</h3><ul><li>Following or contacting a woman repeatedly after she has indicated disinterest is a criminal offense.</li><li>Monitoring a woman''s online activity without consent is cyberstalking.</li></ul><h3>Important Numbers</h3><ul><li>Women Helpline: <strong>181</strong></li><li>Police: <strong>100</strong></li><li>Domestic Violence: <strong>181</strong></li></ul>',
  8, 'Beginner'
);

-- === EMERGENCY RESPONSE ===
INSERT INTO lessons (category_id, title, description, content, duration, difficulty) VALUES
(
  (SELECT id FROM learning_categories WHERE title = 'Emergency Response'),
  'Basic First Aid for Women',
  'Essential first aid skills that can save lives.',
  '<h2>First Aid Basics</h2><p>In an emergency, the first few minutes are critical. Knowing basic first aid can save your life or someone else''s.</p><h3>The DRABC Protocol</h3><ol><li><strong>D - Danger:</strong> Check if the area is safe for you.</li><li><strong>R - Response:</strong> Tap the person and ask "Are you okay?"</li><li><strong>A - Airway:</strong> Tilt head back, lift chin to open airway.</li><li><strong>B - Breathing:</strong> Look, listen, and feel for breathing for 10 seconds.</li><li><strong>C - Call:</strong> Call emergency services immediately.</li></ol><h3>Common Situations</h3><ul><li><strong>Bleeding:</strong> Apply firm pressure with a clean cloth. Elevate the wound above the heart.</li><li><strong>Burns:</strong> Cool with running water for 20 minutes. Do NOT apply ice or butter.</li><li><strong>Sprains:</strong> Rest, Ice, Compression, Elevation (RICE).</li><li><strong>Fainting:</strong> Lay the person flat, elevate legs, ensure fresh air.</li></ul>',
  7, 'Beginner'
);

-- === SAFE TRAVEL ===
INSERT INTO lessons (category_id, title, description, content, duration, difficulty) VALUES
(
  (SELECT id FROM learning_categories WHERE title = 'Safe Travel'),
  'Safe Commuting at Night',
  'Essential strategies for traveling safely after dark.',
  '<h2>Night Safety Strategies</h2><h3>Before You Leave</h3><ul><li>Share your live location with a trusted contact.</li><li>Ensure your phone has at least 50% battery.</li><li>Plan your route in advance and stick to well-lit roads.</li><li>Have your keys ready before you reach your door.</li></ul><h3>While Walking</h3><ul><li>Walk facing traffic so you can see approaching vehicles.</li><li>Avoid using earphones - you need to hear your surroundings.</li><li>Stay in well-lit areas, even if it means a longer route.</li><li>If you feel followed, cross the street and head toward a busy area.</li></ul><h3>Using Ride-Sharing</h3><ul><li>Always check the license plate and driver photo before entering.</li><li>Share the ride details with someone.</li><li>Sit in the back seat behind the driver.</li><li>Use the in-app emergency button if something feels wrong.</li></ul>',
  5, 'Beginner'
),
(
  (SELECT id FROM learning_categories WHERE title = 'Safe Travel'),
  'Solo Travel Safety',
  'Tips for women traveling alone, domestically or internationally.',
  '<h2>Solo Travel Empowerment</h2><p>Traveling alone can be incredibly rewarding. Here is how to do it safely.</p><h3>Before Your Trip</h3><ul><li>Research your destination''s safety rating and local customs.</li><li>Make copies of your ID, passport, and insurance.</li><li>Register with your embassy if traveling internationally.</li><li>Book your first night''s accommodation in advance.</li></ul><h3>During Your Trip</h3><ul><li>Stay in accommodations with 24/7 reception.</li><li>Use a door wedge or portable lock for your room.</li><li>Do not share your hotel name or room number publicly.</li><li>Keep a "safety fund" - emergency cash hidden separately from your wallet.</li><li>Trust your instincts. If a place or person feels wrong, leave.</li></ul>',
  6, 'Intermediate'
);

-- === DIGITAL PRIVACY ===
INSERT INTO lessons (category_id, title, description, content, duration, difficulty) VALUES
(
  (SELECT id FROM learning_categories WHERE title = 'Digital Privacy'),
  'Social Media Safety',
  'How to protect yourself from online predators and stalkers.',
  '<h2>Social Media Risks</h2><p>Social media can reveal more about you than you think. Stalkers and predators use this information to track victims.</p><h3>Critical Privacy Settings</h3><ul><li>Set ALL profiles to <strong>Private</strong>.</li><li>Disable location tagging on posts.</li><li>Never post your home address, workplace, or daily routine.</li><li>Review tagged photos before they appear on your profile.</li><li>Limit who can see your friends list.</li></ul><h3>Red Flag Behaviors from Others</h3><ul><li>Someone who likes/comments on ALL your old posts.</li><li>Strangers who know details about your life you never shared publicly.</li><li>People who create fake profiles to follow you.</li><li>Anyone who asks for your location or schedule.</li></ul><h3>The "Digital Footprint" Test</h3><p>Google yourself. If you can find your home, workplace, or phone number, so can a predator. Remove or request deletion of this information.</p>',
  5, 'Beginner'
);

-- === SCAM AWARENESS ===
INSERT INTO lessons (category_id, title, description, content, duration, difficulty) VALUES
(
  (SELECT id FROM learning_categories WHERE title = 'Scam Awareness'),
  'Common Scams Targeting Women',
  'Recognize and avoid the most dangerous scams.',
  '<h2>Scams You Must Know</h2><h3>1. Romance Scams</h3><p>Scammers create fake profiles on dating apps, build emotional trust over weeks/months, then ask for money. <strong>Never send money to someone you have only met online.</strong></p><h3>2. Job Scams</h3><p>"Work from home, earn $5000/week!" These scams ask for your bank details or an "advance fee." Real employers never ask for money upfront.</p><h3>3. Tech Support Scams</h3><p>A popup says "Your computer has a virus! Call this number." They gain remote access to your computer and steal data. <strong>Real companies never call you unsolicited.</strong></p><h3>4. Sextortion</h3><p>Scammers threaten to share intimate photos unless you pay. <strong>Do not pay.</strong> Report to cyber police immediately. Paying never stops the blackmail.</p><h3>What to Do If Scammed</h3><ol><li>Stop all contact with the scammer.</li><li>Do NOT send any more money.</li><li>Report to local cyber police.</li><li>Change all passwords.</li><li>Contact your bank to freeze transactions.</li></ol>',
  7, 'Beginner'
);

-- 3. QUIZZES
-- Quiz for: Situational Awareness 101
INSERT INTO quizzes (lesson_id, title, passing_marks) VALUES
(
  (SELECT id FROM lessons WHERE title = 'Situational Awareness 101'),
  'Situational Awareness Quiz',
  70
);

INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_option) VALUES
(
  (SELECT id FROM quizzes WHERE title = 'Situational Awareness Quiz'),
  'What is the FIRST level of situational awareness?',
  'Projection', 'Comprehension', 'Perception', 'Reaction', 'C'
),
(
  (SELECT id FROM quizzes WHERE title = 'Situational Awareness Quiz'),
  'What should you do if you feel someone is following you?',
  'Speed up and run home', 'Turn around and confront them', 'Cross the street and head to a busy area', 'Call the person out loudly', 'C'
),
(
  (SELECT id FROM quizzes WHERE title = 'Situational Awareness Quiz'),
  'Why should you shout FIRE instead of HELP in an emergency?',
  'Fire is louder', 'People respond faster to fire alarms', 'Help sounds like a prank', 'Fire departments arrive faster', 'B'
);

-- Quiz for: Strong Passwords & 2FA
INSERT INTO quizzes (lesson_id, title, passing_marks) VALUES
(
  (SELECT id FROM lessons WHERE title = 'Strong Passwords & 2FA'),
  'Password Security Quiz',
  70
);

INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_option) VALUES
(
  (SELECT id FROM quizzes WHERE title = 'Password Security Quiz'),
  'What is the minimum recommended password length?',
  '6 characters', '8 characters', '12 characters', '20 characters', 'C'
),
(
  (SELECT id FROM quizzes WHERE title = 'Password Security Quiz'),
  'Which is the BEST form of 2FA?',
  'Security questions', 'SMS codes', 'Authenticator apps', 'Email verification', 'C'
),
(
  (SELECT id FROM quizzes WHERE title = 'Password Security Quiz'),
  'Which password is strongest?',
  'P@ssw0rd123', 'PurpleTiger$Runs42Miles!', 'john12345', 'Qwerty!@#', 'B'
);

-- Quiz for: Safe Commuting at Night
INSERT INTO quizzes (lesson_id, title, passing_marks) VALUES
(
  (SELECT id FROM lessons WHERE title = 'Safe Commuting at Night'),
  'Night Safety Quiz',
  70
);

INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_option) VALUES
(
  (SELECT id FROM quizzes WHERE title = 'Night Safety Quiz'),
  'What should you do before reaching your door at night?',
  'Check your phone', 'Have your keys ready', 'Ring the doorbell', 'Wait for a neighbor', 'B'
),
(
  (SELECT id FROM quizzes WHERE title = 'Night Safety Quiz'),
  'Why should you walk facing traffic at night?',
  'To see oncoming vehicles', 'It is legally required', 'It is faster', 'Drivers can see you better', 'A'
),
(
  (SELECT id FROM quizzes WHERE title = 'Night Safety Quiz'),
  'Where should you sit in a ride-sharing vehicle?',
  'Front passenger seat', 'Back seat behind driver', 'Back seat behind passenger', 'Anywhere', 'B'
);

-- 4. BADGES
INSERT INTO badges (name, description, icon, required_points, rule_type) VALUES
('Bronze Defender', 'Complete 3 safety lessons', '🥉', 3, 'LESSONS_COMPLETED'),
('Silver Guardian', 'Complete 6 safety lessons', '🥈', 6, 'LESSONS_COMPLETED'),
('Gold Protector', 'Score above 90% on any quiz', '🥇', 90, 'QUIZ_SCORE'),
('Safety Expert', 'Complete all available lessons', '🏆', 10, 'LESSONS_COMPLETED');

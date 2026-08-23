-- ============================================================================
-- Reference data: starter tags + badges
-- Safe to re-run (on conflict do nothing).
-- ============================================================================

insert into public.tags (slug, name) values
  ('javascript', 'JavaScript'),
  ('typescript', 'TypeScript'),
  ('react', 'React'),
  ('nextjs', 'Next.js'),
  ('nodejs', 'Node.js'),
  ('vue', 'Vue'),
  ('angular', 'Angular'),
  ('express', 'Express'),
  ('vite', 'Vite'),
  ('webpack', 'Webpack'),
  ('babel', 'Babel'),
  ('npm', 'npm'),
  ('jest', 'Jest'),
  ('testing', 'Testing'),
  ('performance', 'Performance'),
  ('security', 'Security'),
  ('web-apis', 'Web APIs'),
  ('css', 'CSS'),
  ('frontend', 'Frontend'),
  ('backend', 'Backend'),
  ('ecmascript', 'ECMAScript'),
  ('tc39', 'TC39'),
  ('v8', 'V8'),
  ('chrome', 'Chrome')
on conflict (slug) do nothing;

insert into public.badges (slug, name, description, icon) values
  ('first-question', 'أول سؤال', 'طرحت أول سؤال لك في المجتمع', 'help-circle'),
  ('first-answer', 'أول إجابة', 'قدّمت أول إجابة لك في المجتمع', 'message-square'),
  ('helpful-developer', 'مطور مفيد', 'حصلت إجاباتك على تقييم إيجابي من المجتمع', 'heart-handshake'),
  ('news-hunter', 'صياد الأخبار', 'قدّمت أخبارًا تمت الموافقة عليها', 'newspaper'),
  ('problem-solver', 'حلّال المشاكل', 'حصلت على عدة إجابات مقبولة', 'check-circle'),
  ('top-contributor', 'مساهم مميز', 'من أكثر الأعضاء مساهمة في المجتمع', 'trophy'),
  ('javascript-expert', 'خبير JavaScript', 'أثبتت خبرة عميقة في JavaScript', 'code-2')
on conflict (slug) do nothing;

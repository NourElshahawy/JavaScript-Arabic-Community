import { HelpCircle, MessageSquare, HeartHandshake, Newspaper, CheckCircle, Trophy, Code2, Award } from "lucide-react";

const ICONS = {
  "help-circle": HelpCircle,
  "message-square": MessageSquare,
  "heart-handshake": HeartHandshake,
  newspaper: Newspaper,
  "check-circle": CheckCircle,
  trophy: Trophy,
  "code-2": Code2,
};

export function ProfileBadges({ badges }) {
  if (!badges.length) return null;

  return (
    <div className="tag-list">
      {badges.map(({ badge }) => {
        const Icon = ICONS[badge.icon] ?? Award;
        return (
          <span key={badge.id} className="badge badge--brand" title={badge.description}>
            <Icon size={12} /> {badge.name}
          </span>
        );
      })}
    </div>
  );
}

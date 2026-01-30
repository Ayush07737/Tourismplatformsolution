import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'bn', label: 'Bengali' },
  { value: 'te', label: 'Telugu' },
  { value: 'mr', label: 'Marathi' },
  { value: 'ta', label: 'Tamil' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'kn', label: 'Kannada' },
  { value: 'ml', label: 'Malayalam' },
];

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [submitting, setSubmitting] = useState(false);
  const { user, loading, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;
    setSubmitting(true);
    const { error } = await signUp(email.trim(), password, {
      name: name.trim(),
      phone: phone.trim() || undefined,
      preferred_language: preferredLanguage,
    });
    setSubmitting(false);
    if (!error) navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="animate-spin h-10 w-10 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Join YatraConnect with your details</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reg-name">Name</Label>
              <Input
                id="reg-name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-phone">Phone (optional)</Label>
              <Input
                id="reg-phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Password</Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
                disabled={submitting}
              />
              <p className="text-xs text-muted-foreground">At least 6 characters</p>
            </div>
            <div className="space-y-2">
              <Label>Preferred language</Label>
              <Select value={preferredLanguage} onValueChange={setPreferredLanguage} disabled={submitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Optional: Aadhaar/ID verification can be added later from your profile for verified badge.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Register'
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

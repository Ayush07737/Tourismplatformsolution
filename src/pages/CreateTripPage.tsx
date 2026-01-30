import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTrip, type TripPayload } from '../api/trips';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { toast } from 'sonner';

const DEFAULT_LAT = 28.6139; // Delhi as fallback
const DEFAULT_LNG = 77.209;

type CreateTripPageProps = {
  onTripCreated?: () => void;
};

export function CreateTripPage({ onTripCreated }: CreateTripPageProps) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    startCity: '',
    startLat: DEFAULT_LAT,
    startLng: DEFAULT_LNG,
    destCity: '',
    destLat: DEFAULT_LAT,
    destLng: DEFAULT_LNG,
    startDate: '',
    endDate: '',
    minBudget: '',
    maxBudget: '',
    tripType: 'leisure',
    maxTravelers: '4',
    preferences: [] as string[],
    genderPreference: 'any',
    visibility: 'public',
    description: '',
  });

  function handleChange<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function togglePreference(pref: string) {
    setForm((prev) => {
      const exists = prev.preferences.includes(pref);
      return {
        ...prev,
        preferences: exists
          ? prev.preferences.filter((p) => p !== pref)
          : [...prev.preferences, pref],
      };
    });
  }

  const preferenceOptions = [
    'Budget',
    'Luxury',
    'Adventure',
    'Culture',
    'Food',
    'Nightlife',
    'Photography',
    'Road trip',
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.startCity || !form.destCity || !form.startDate || !form.endDate) {
      toast.error('Please fill all required fields.');
      return;
    }

    const payload: TripPayload = {
      startLocation: {
        city: form.startCity,
        lat: form.startLat,
        lng: form.startLng,
      },
      destination: {
        city: form.destCity,
        lat: form.destLat,
        lng: form.destLng,
      },
      startDate: form.startDate,
      endDate: form.endDate,
      budget: {
        min: Number(form.minBudget || 0),
        max: Number(form.maxBudget || 0),
      },
      tripType: form.tripType,
      maxTravelers: Number(form.maxTravelers || 1),
      preferences: form.preferences,
      genderPreference: form.genderPreference,
      visibility: form.visibility as 'public' | 'invite-only',
      description: form.description || undefined,
    };

    try {
      setSubmitting(true);
      await createTrip(payload);
      toast.success('Trip posted successfully!');
      if (onTripCreated) {
        onTripCreated();
      } else {
        navigate('/explore');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to post trip');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Post a Trip</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Starting location (city)</Label>
                <Input
                  placeholder="e.g., Delhi"
                  value={form.startCity}
                  onChange={(e) => handleChange('startCity', e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  In production, connect this to Google Places autocomplete.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Destination (city)</Label>
                <Input
                  placeholder="e.g., Manali"
                  value={form.destCity}
                  onChange={(e) => handleChange('destCity', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Start date</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>End date</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Budget min (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.minBudget}
                  onChange={(e) => handleChange('minBudget', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Budget max (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.maxBudget}
                  onChange={(e) => handleChange('maxBudget', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Trip type</Label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={form.tripType}
                  onChange={(e) => handleChange('tripType', e.target.value)}
                >
                  <option value="leisure">Leisure</option>
                  <option value="adventure">Adventure</option>
                  <option value="business">Business</option>
                  <option value="backpacking">Backpacking</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Max travelers</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={form.maxTravelers}
                  onChange={(e) =>
                    handleChange('maxTravelers', e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Gender preference</Label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={form.genderPreference}
                  onChange={(e) =>
                    handleChange('genderPreference', e.target.value)
                  }
                >
                  <option value="any">Any</option>
                  <option value="women-only">Women only</option>
                  <option value="men-only">Men only</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Visibility</Label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={form.visibility}
                  onChange={(e) =>
                    handleChange(
                      'visibility',
                      e.target.value as 'public' | 'invite-only',
                    )
                  }
                >
                  <option value="public">Public</option>
                  <option value="invite-only">Invite-only</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preferences</Label>
              <div className="flex flex-wrap gap-2">
                {preferenceOptions.map((pref) => {
                  const selected = form.preferences.includes(pref);
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => togglePreference(pref)}
                      className={[
                        'px-3 py-1 rounded-full text-xs border transition',
                        selected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-muted',
                      ].join(' ')}
                    >
                      {pref}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Optional description</Label>
              <Textarea
                rows={3}
                placeholder="Share more about your plan, expectations, etc."
                value={form.description}
                onChange={(e) =>
                  handleChange('description', e.target.value)
                }
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Posting...' : 'Post trip'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


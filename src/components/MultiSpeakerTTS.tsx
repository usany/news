import { useState } from 'react';
import { AVAILABLE_VOICES } from '../lib/voices';

interface Speaker {
  name: string;
  voiceName: string;
}

const EXAMPLE_CONVERSATIONS = [
  {
    name: 'Joe & Jane Interview',
    speakers: [
      { name: 'Joe', voiceName: 'Kore' },
      { name: 'Jane', voiceName: 'Puck' },
    ],
    prompt: `TTS the following conversation between Joe and Jane:
Joe: How's it going today Jane?
Jane: Not too bad, how about you?
Joe: I'm doing pretty well, thanks for asking!
Jane: That's great to hear!`,
  },
  {
    name: 'Customer Support Chat',
    speakers: [
      { name: 'Agent', voiceName: 'Sage' },
      { name: 'Customer', voiceName: 'Breeze' },
    ],
    prompt: `TTS the following customer support conversation between Agent and Customer:
Agent: Thank you for calling support. How can I help you today?
Customer: I'm having trouble with my account login.
Agent: I'd be happy to help. Can you tell me what error message you're seeing?
Customer: It says my password is incorrect, but I'm sure it's right.
Agent: Let me reset your password and send you a temporary one.`,
  },
];

export default function MultiSpeakerTTS() {
  const [speakers, setSpeakers] = useState<Speaker[]>([
    { name: 'Speaker 1', voiceName: 'Kore' },
    { name: 'Speaker 2', voiceName: 'Puck' },
  ]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  const updateSpeaker = (index: number, key: keyof Speaker, value: string) => {
    const newSpeakers = [...speakers];
    newSpeakers[index][key] = value;
    setSpeakers(newSpeakers);
  };

  const addSpeaker = () => {
    if (speakers.length < 2) {
      setSpeakers([...speakers, { name: `Speaker ${speakers.length + 1}`, voiceName: 'Kore' }]);
    }
  };

  const removeSpeaker = (index: number) => {
    setSpeakers(speakers.filter((_, i) => i !== index));
  };

  const loadExample = (example: typeof EXAMPLE_CONVERSATIONS[0]) => {
    setSpeakers(example.speakers);
    setPrompt(example.prompt);
  };

  const generateAudio = async () => {
    setError('');
    setAudioUrl('');

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (speakers.length === 0) {
      setError('Please add at least one speaker');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/tts/multi-speaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speakers, prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Multi-Speaker TTS Generator</h1>

      {/* Examples */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Quick Examples</h2>
        <div className="flex gap-2">
          {EXAMPLE_CONVERSATIONS.map((example, idx) => (
            <button
              key={idx}
              onClick={() => loadExample(example)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {example.name}
            </button>
          ))}
        </div>
      </div>

      {/* Speakers Configuration */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Speakers</h2>
        <div className="space-y-4">
          {speakers.map((speaker, index) => (
            <div key={index} className="flex gap-3 p-4 bg-gray-100 rounded">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={speaker.name}
                  onChange={(e) => updateSpeaker(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="e.g., Joe"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Voice</label>
                <select
                  value={speaker.voiceName}
                  onChange={(e) => updateSpeaker(index, 'voiceName', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  {AVAILABLE_VOICES.map((voice) => (
                    <option key={voice} value={voice}>
                      {voice}
                    </option>
                  ))}
                </select>
              </div>
              {speakers.length > 1 && (
                <button
                  onClick={() => removeSpeaker(index)}
                  className="self-end px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        {speakers.length < 2 && (
          <button
            onClick={addSpeaker}
            className="mt-3 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Speaker
          </button>
        )}
      </div>

      {/* Prompt */}
      <div className="mb-6">
        <label className="block text-lg font-semibold mb-3">Conversation Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full px-4 py-3 border rounded h-40"
          placeholder="Enter the conversation text. Use speaker names to indicate who is speaking..."
        />
        <p className="text-sm text-gray-600 mt-2">
          Tip: Use speaker names in the text like: "Joe: Hello! Jane: Hi there!"
        </p>
      </div>

      {/* Error Message */}
      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

      {/* Generate Button */}
      <button
        onClick={generateAudio}
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Generating Audio...' : 'Generate Audio'}
      </button>

      {/* Audio Player */}
      {audioUrl && (
        <div className="mt-6 p-4 bg-green-100 rounded">
          <h3 className="text-lg font-semibold mb-3">Generated Audio</h3>
          <audio controls className="w-full mb-3">
            <source src={audioUrl} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
          <a
            href={audioUrl}
            download="output.wav"
            className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Download Audio
          </a>
        </div>
      )}
    </div>
  );
}

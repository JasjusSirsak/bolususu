import React, { useState } from 'react';
import { Palette, Type, Layout, Zap, Copy, Check } from 'lucide-react';

const DesignSystem = () => {
  const [copiedItem, setCopiedItem] = useState(null);

  const copyToClipboard = (text, item) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(item);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const ColorSwatch = ({ name, hex, description }) => (
    <div className="group relative">
      <div 
        className="h-24 rounded-lg shadow-sm cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 relative overflow-hidden"
        style={{ backgroundColor: hex }}
        onClick={() => copyToClipboard(hex, name)}
      >
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        {copiedItem === name && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Check className="text-white w-8 h-8 animate-bounce" />
          </div>
        )}
      </div>
      <div className="mt-2">
        <p className="font-semibold text-sm text-gray-800">{name}</p>
        <p className="text-xs text-gray-500 font-mono">{hex}</p>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </div>
    </div>
  );

  const ComponentDemo = ({ title, children }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-3 text-gray-800" style={{ fontFamily: 'serif' }}>
            Insight Design System
          </h1>
          <p className="text-gray-600 text-lg">Vintage Warmth meets Modern Collaboration</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
            <span className="text-sm text-gray-500">Inspired by</span>
            <span className="font-semibold text-orange-600">Reverse 1999</span>
            <span className="text-sm text-gray-400">×</span>
            <span className="font-semibold text-gray-700">Notion</span>
          </div>
        </div>

        {/* Color Palette */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="text-orange-600" />
            <h2 className="text-3xl font-bold text-gray-800">Color Palette</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <ColorSwatch 
              name="Primary Warm"
              hex="#CC6600"
              description="Main brand color - CTAs, highlights"
            />
            <ColorSwatch 
              name="Primary Dark"
              hex="#A55200"
              description="Hover states, emphasis"
            />
            <ColorSwatch 
              name="Text Primary"
              hex="#333333"
              description="Main text, headings"
            />
            <ColorSwatch 
              name="Background"
              hex="#F7F0DE"
              description="Page background - vintage paper"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <ColorSwatch 
              name="Accent Sepia"
              hex="#D4A574"
              description="Vintage accents"
            />
            <ColorSwatch 
              name="Success Green"
              hex="#52A864"
              description="Success states"
            />
            <ColorSwatch 
              name="Warning Gold"
              hex="#E8B85C"
              description="Warnings"
            />
            <ColorSwatch 
              name="Error Red"
              hex="#D15B5B"
              description="Errors"
            />
            <ColorSwatch 
              name="Info Blue"
              hex="#5B8AC9"
              description="Information"
            />
          </div>
        </section>

        {/* Typography */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Type className="text-orange-600" />
            <h2 className="text-3xl font-bold text-gray-800">Typography</h2>
          </div>
          
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Display / Headings</p>
                <h1 className="text-5xl font-bold text-gray-800" style={{ fontFamily: 'serif' }}>
                  Zen Antique Soft
                </h1>
                <p className="text-xs text-gray-400 mt-1 font-mono">font-family: 'Zen Antique Soft', serif</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Body Text</p>
                <p className="text-base text-gray-700" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  The quick brown fox jumps over the lazy dog. System UI provides excellent readability for body content.
                </p>
                <p className="text-xs text-gray-400 mt-1 font-mono">font-family: system-ui, -apple-system, sans-serif</p>
              </div>

              <div className="grid grid-cols-2 gap-8 mt-6">
                <div>
                  <p className="text-xs text-gray-400 mb-3">Heading Sizes</p>
                  <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'serif' }}>H1 - 2.25rem</h1>
                  <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'serif' }}>H2 - 1.875rem</h2>
                  <h3 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'serif' }}>H3 - 1.5rem</h3>
                  <h4 className="text-xl font-semibold" style={{ fontFamily: 'serif' }}>H4 - 1.25rem</h4>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-3">Body Sizes</p>
                  <p className="text-lg mb-2">Large - 1.125rem</p>
                  <p className="text-base mb-2">Base - 1rem</p>
                  <p className="text-sm mb-2">Small - 0.875rem</p>
                  <p className="text-xs">XSmall - 0.75rem</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing & Layout */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Layout className="text-orange-600" />
            <h2 className="text-3xl font-bold text-gray-800">Spacing & Layout</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <ComponentDemo title="Spacing Scale">
              <div className="space-y-3">
                {[
                  { name: 'xs', size: '0.25rem', px: '4px' },
                  { name: 'sm', size: '0.5rem', px: '8px' },
                  { name: 'md', size: '1rem', px: '16px' },
                  { name: 'lg', size: '1.5rem', px: '24px' },
                  { name: 'xl', size: '2rem', px: '32px' },
                  { name: '2xl', size: '3rem', px: '48px' },
                ].map(space => (
                  <div key={space.name} className="flex items-center gap-4">
                    <div 
                      className="bg-orange-200 rounded"
                      style={{ width: space.size, height: space.size }}
                    />
                    <span className="text-sm font-mono text-gray-600">{space.name}</span>
                    <span className="text-xs text-gray-400">{space.size} ({space.px})</span>
                  </div>
                ))}
              </div>
            </ComponentDemo>

            <ComponentDemo title="Border Radius">
              <div className="space-y-3">
                {[
                  { name: 'sm', radius: '0.25rem' },
                  { name: 'md', radius: '0.5rem' },
                  { name: 'lg', radius: '0.75rem' },
                  { name: 'xl', radius: '1rem' },
                  { name: 'full', radius: '9999px' },
                ].map(radius => (
                  <div key={radius.name} className="flex items-center gap-4">
                    <div 
                      className="bg-orange-100 border-2 border-orange-300 w-12 h-12"
                      style={{ borderRadius: radius.radius }}
                    />
                    <span className="text-sm font-mono text-gray-600">{radius.name}</span>
                    <span className="text-xs text-gray-400">{radius.radius}</span>
                  </div>
                ))}
              </div>
            </ComponentDemo>
          </div>
        </section>

        {/* Components Preview */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="text-orange-600" />
            <h2 className="text-3xl font-bold text-gray-800">Component Examples</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <ComponentDemo title="Buttons">
              <div className="space-y-4">
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
                  Primary Button
                </button>
                <button className="w-full border-2 border-orange-600 text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-lg font-semibold transition-all duration-200">
                  Secondary Button
                </button>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200">
                  Tertiary Button
                </button>
              </div>
            </ComponentDemo>

            <ComponentDemo title="Input Fields">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Text Input
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter text..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-600 focus:outline-none transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    With Icon
                  </label>
                  <div className="relative">
                    <Copy className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                    <input 
                      type="text" 
                      placeholder="Paste code here..."
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-600 focus:outline-none transition-colors duration-200"
                    />
                  </div>
                </div>
              </div>
            </ComponentDemo>

            <ComponentDemo title="Cards">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <h4 className="font-semibold text-gray-800 mb-1">Vintage Card</h4>
                  <p className="text-sm text-gray-600">Warm, inviting card design</p>
                </div>
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-md transition-all duration-300 cursor-pointer">
                  <h4 className="font-semibold text-gray-800 mb-1">Clean Card</h4>
                  <p className="text-sm text-gray-600">Modern, minimal approach</p>
                </div>
              </div>
            </ComponentDemo>

            <ComponentDemo title="Badges & Tags">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                    Admin
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    Member
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    Active
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                    8 members
                  </span>
                  <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium border border-amber-200">
                    Recent
                  </span>
                </div>
              </div>
            </ComponentDemo>
          </div>
        </section>

        {/* Animation Principles */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="text-orange-600" />
            <h2 className="text-3xl font-bold text-gray-800">Animation Principles</h2>
          </div>
          
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Duration</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Fast: 150ms (hover)</li>
                  <li>• Normal: 200-300ms (transitions)</li>
                  <li>• Slow: 400-500ms (page loads)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Easing</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• ease-out (default)</li>
                  <li>• ease-in-out (modals)</li>
                  <li>• cubic-bezier (custom)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Properties</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• opacity (fade)</li>
                  <li>• transform (move/scale)</li>
                  <li>• background-color</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Note */}
        <div className="bg-gradient-to-r from-orange-100 to-amber-100 border-l-4 border-orange-600 rounded-lg p-6">
          <h3 className="font-bold text-gray-800 mb-2">💡 Implementation Note</h3>
          <p className="text-gray-700 text-sm leading-relaxed">
            Design system ini dirancang untuk memberikan konsistensi visual sambil mempertahankan 
            <strong className="text-orange-700"> warmth vintage Reverse 1999</strong> dan 
            <strong className="text-orange-700"> clean functionality Notion</strong>. 
            Gunakan komponen ini sebagai building blocks untuk semua halaman Insight.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DesignSystem;
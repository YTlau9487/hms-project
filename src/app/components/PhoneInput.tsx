import React, { useState, useRef, useEffect } from 'react';
import { Country, getCountries, getCountryCallingCode } from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import { parsePhoneNumber } from 'libphonenumber-js';

interface PhoneInputProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  defaultCountry?: Country;
  disabled?: boolean;
  error?: boolean;
  placeholder?: string;
  className?: string;
}

// Shared utility for read-only phone display
export function formatPhoneDisplay(phone: string | null | undefined): string {
  if (!phone) return '';
  try {
    const phoneNumber = parsePhoneNumber(phone);
    if (phoneNumber && phoneNumber.isValid()) {
      return phoneNumber.formatNational();
    }
  } catch {
    // fall through
  }
  return phone;
}

// Country names mapping for search
const countryNames: Record<string, string> = {
  AC: 'Ascension Island', AD: 'Andorra', AE: 'United Arab Emirates', AF: 'Afghanistan',
  AG: 'Antigua and Barbuda', AI: 'Anguilla', AL: 'Albania', AM: 'Armenia', AO: 'Angola',
  AR: 'Argentina', AS: 'American Samoa', AT: 'Austria', AU: 'Australia', AW: 'Aruba',
  AX: 'Åland Islands', AZ: 'Azerbaijan', BA: 'Bosnia and Herzegovina', BB: 'Barbados',
  BD: 'Bangladesh', BE: 'Belgium', BF: 'Burkina Faso', BG: 'Bulgaria', BH: 'Bahrain',
  BI: 'Burundi', BJ: 'Benin', BL: 'Saint Barthélemy', BM: 'Bermuda', BN: 'Brunei',
  BO: 'Bolivia', BQ: 'Caribbean Netherlands', BR: 'Brazil', BS: 'Bahamas', BT: 'Bhutan',
  BW: 'Botswana', BY: 'Belarus', BZ: 'Belize', CA: 'Canada', CC: 'Cocos Islands',
  CD: 'Democratic Republic of the Congo', CF: 'Central African Republic', CG: 'Republic of the Congo',
  CH: 'Switzerland', CI: 'Ivory Coast', CK: 'Cook Islands', CL: 'Chile', CM: 'Cameroon',
  CN: 'China', CO: 'Colombia', CR: 'Costa Rica', CU: 'Cuba', CV: 'Cape Verde',
  CW: 'Curaçao', CX: 'Christmas Island', CY: 'Cyprus', CZ: 'Czech Republic',
  DE: 'Germany', DJ: 'Djibouti', DK: 'Denmark', DM: 'Dominica', DO: 'Dominican Republic',
  DZ: 'Algeria', EC: 'Ecuador', EE: 'Estonia', EG: 'Egypt', EH: 'Western Sahara',
  ER: 'Eritrea', ES: 'Spain', ET: 'Ethiopia', FI: 'Finland', FJ: 'Fiji',
  FK: 'Falkland Islands', FM: 'Micronesia', FO: 'Faroe Islands', FR: 'France',
  GA: 'Gabon', GB: 'United Kingdom', GD: 'Grenada', GE: 'Georgia', GF: 'French Guiana',
  GG: 'Guernsey', GH: 'Ghana', GI: 'Gibraltar', GL: 'Greenland', GM: 'Gambia',
  GN: 'Guinea', GP: 'Guadeloupe', GQ: 'Equatorial Guinea', GR: 'Greece',
  GS: 'South Georgia and the South Sandwich Islands', GT: 'Guatemala', GU: 'Guam',
  GW: 'Guinea-Bissau', GY: 'Guyana', HK: 'Hong Kong', HN: 'Honduras', HR: 'Croatia',
  HT: 'Haiti', HU: 'Hungary', ID: 'Indonesia', IE: 'Ireland', IL: 'Israel',
  IM: 'Isle of Man', IN: 'India', IO: 'British Indian Ocean Territory', IQ: 'Iraq',
  IR: 'Iran', IS: 'Iceland', IT: 'Italy', JE: 'Jersey', JM: 'Jamaica', JO: 'Jordan',
  JP: 'Japan', KE: 'Kenya', KG: 'Kyrgyzstan', KH: 'Cambodia', KI: 'Kiribati',
  KM: 'Comoros', KN: 'Saint Kitts and Nevis', KP: 'North Korea', KR: 'South Korea',
  KW: 'Kuwait', KY: 'Cayman Islands', KZ: 'Kazakhstan', LA: 'Laos', LB: 'Lebanon',
  LC: 'Saint Lucia', LI: 'Liechtenstein', LK: 'Sri Lanka', LR: 'Liberia', LS: 'Lesotho',
  LT: 'Lithuania', LU: 'Luxembourg', LV: 'Latvia', LY: 'Libya', MA: 'Morocco',
  MC: 'Monaco', MD: 'Moldova', ME: 'Montenegro', MF: 'Saint Martin', MG: 'Madagascar',
  MH: 'Marshall Islands', MK: 'North Macedonia', ML: 'Mali', MM: 'Myanmar',
  MN: 'Mongolia', MO: 'Macau', MP: 'Northern Mariana Islands', MQ: 'Martinique',
  MR: 'Mauritania', MS: 'Montserrat', MT: 'Malta', MU: 'Mauritius', MV: 'Maldives',
  MW: 'Malawi', MX: 'Mexico', MY: 'Malaysia', MZ: 'Mozambique', NA: 'Namibia',
  NC: 'New Caledonia', NE: 'Niger', NF: 'Norfolk Island', NG: 'Nigeria', NI: 'Nicaragua',
  NL: 'Netherlands', NO: 'Norway', NP: 'Nepal', NR: 'Nauru', NU: 'Niue',
  NZ: 'New Zealand', OM: 'Oman', PA: 'Panama', PE: 'Peru', PF: 'French Polynesia',
  PG: 'Papua New Guinea', PH: 'Philippines', PK: 'Pakistan', PL: 'Poland',
  PM: 'Saint Pierre and Miquelon', PR: 'Puerto Rico', PS: 'Palestine', PT: 'Portugal',
  PW: 'Palau', PY: 'Paraguay', QA: 'Qatar', RE: 'Réunion', RO: 'Romania',
  RS: 'Serbia', RU: 'Russia', RW: 'Rwanda', SA: 'Saudi Arabia', SB: 'Solomon Islands',
  SC: 'Seychelles', SD: 'Sudan', SE: 'Sweden', SG: 'Singapore', SH: 'Saint Helena',
  SI: 'Slovenia', SJ: 'Svalbard and Jan Mayen', SK: 'Slovakia', SL: 'Sierra Leone',
  SM: 'San Marino', SN: 'Senegal', SO: 'Somalia', SR: 'Suriname', SS: 'South Sudan',
  ST: 'São Tomé and Príncipe', SV: 'El Salvador', SX: 'Sint Maarten',
  SY: 'Syria', SZ: 'Eswatini', TA: 'Tristan da Cunha', TC: 'Turks and Caicos Islands',
  TD: 'Chad', TF: 'French Southern Territories', TG: 'Togo', TH: 'Thailand',
  TJ: 'Tajikistan', TK: 'Tokelau', TL: 'Timor-Leste', TM: 'Turkmenistan',
  TN: 'Tunisia', TO: 'Tonga', TR: 'Turkey', TT: 'Trinidad and Tobago',
  TV: 'Tuvalu', TW: 'Taiwan', TZ: 'Tanzania', UA: 'Ukraine', UG: 'Uganda',
  UM: 'United States Minor Outlying Islands', US: 'United States', UY: 'Uruguay',
  UZ: 'Uzbekistan', VA: 'Vatican City', VC: 'Saint Vincent and the Grenadines',
  VE: 'Venezuela', VG: 'British Virgin Islands', VI: 'U.S. Virgin Islands',
  VN: 'Vietnam', VU: 'Vanuatu', WF: 'Wallis and Futuna', WS: 'Samoa',
  XK: 'Kosovo', YE: 'Yemen', YT: 'Mayotte', ZA: 'South Africa', ZM: 'Zambia',
  ZW: 'Zimbabwe'
};

// Custom Country Select Component
const CountrySelect: React.FC<{
  value: Country;
  onChange: (value: Country) => void;
  disabled?: boolean;
  error?: boolean;
}> = ({ value, onChange, disabled, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const countries = getCountries();

  const filteredCountries = countries.filter(country => {
    const query = searchQuery.toLowerCase();
    const name = countryNames[country]?.toLowerCase() || '';
    const code = `+${getCountryCallingCode(country)}`;
    return name.includes(query) || code.includes(query) || country.toLowerCase().includes(query);
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (country: Country) => {
    onChange(country);
    setIsOpen(false);
    setSearchQuery('');
  };

  const FlagComponent = flags[value];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium
          bg-input-background border-none transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${error
            ? 'focus:ring-red-500 text-red-600'
            : 'focus:ring-primary text-foreground'
          }
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-muted'}
        `}
      >
        {FlagComponent && <span className="w-6 h-[18px] object-cover rounded-sm flex-shrink-0"><FlagComponent title={value} /></span>}
        <span>+{getCountryCallingCode(value)}</span>
        <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 min-w-[280px] max-h-80 bg-background border border-border rounded-xl shadow-lg overflow-hidden flex flex-col">
          <div className="flex items-center px-3 py-3 border-b border-border bg-muted/50">
            <svg className="w-[18px] h-[18px] text-muted-foreground flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search country or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 ml-2 border-none outline-none text-sm bg-transparent placeholder:text-muted-foreground"
            />
          </div>
          <div className="overflow-y-auto max-h-60">
            {filteredCountries.map(country => {
              const CountryFlag = flags[country];
              return (
                <button
                  key={country}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className={`
                    flex items-center w-full px-3 py-2.5 border-none bg-none cursor-pointer
                    transition-colors duration-150 text-left
                    ${country === value ? 'bg-primary/10' : 'hover:bg-muted'}
                  `}
                >
                  {CountryFlag && <span className="w-6 h-[18px] object-cover rounded-sm flex-shrink-0"><CountryFlag title={country} /></span>}
                  <span className="flex-1 ml-2.5 text-sm text-foreground">{countryNames[country] || country}</span>
                  <span className="text-[13px] text-muted-foreground font-medium">+{getCountryCallingCode(country)}</span>
                </button>
              );
            })}
            {filteredCountries.length === 0 && (
              <div className="px-4 py-4 text-center text-sm text-muted-foreground">No countries found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  defaultCountry = 'HK',
  disabled = false,
  error = false,
  placeholder = 'Phone number',
  className = '',
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry);
  const [nationalInput, setNationalInput] = useState('');

  // Sync from E.164 value into local state
  useEffect(() => {
    if (!value) {
      setSelectedCountry(defaultCountry);
      setNationalInput('');
      return;
    }
    try {
      const phoneNumber = parsePhoneNumber(value);
      if (phoneNumber && phoneNumber.isValid()) {
        setSelectedCountry((phoneNumber.country || defaultCountry) as Country);
        setNationalInput(phoneNumber.formatNational());
        return;
      }
    } catch {
      // fall through
    }
    // Fallback: strip leading + and digits matching default country code
    const callingCode = `+${getCountryCallingCode(defaultCountry)}`;
    if (value.startsWith(callingCode)) {
      setSelectedCountry(defaultCountry);
      setNationalInput(value.slice(callingCode.length));
    } else {
      setSelectedCountry(defaultCountry);
      setNationalInput(value.replace(/^\+/, ''));
    }
  }, [value, defaultCountry]);

  const handleNationalChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '');

    if (!digits) {
      setNationalInput('');
      onChange(undefined);
      return;
    }

    // Format for display using libphonenumber-js
    let displayValue = raw;
    try {
      const parsed = parsePhoneNumber(digits, selectedCountry);
      if (parsed && parsed.isValid()) {
        displayValue = parsed.formatNational();
        onChange(parsed.format('E.164'));
        setNationalInput(displayValue);
        return;
      }
    } catch {
      // fall through
    }

    // Partial input — show raw digits, compose tentative E.164
    setNationalInput(displayValue);
    const callingCode = getCountryCallingCode(selectedCountry);
    onChange(`+${callingCode}${digits}`);
  };

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    setNationalInput('');
    onChange(undefined);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <CountrySelect
        value={selectedCountry}
        onChange={handleCountryChange}
        disabled={disabled}
        error={error}
      />
      <input
        type="tel"
        value={nationalInput}
        onChange={(e) => handleNationalChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          flex-1 min-w-0 px-4 py-2.5 rounded-lg text-sm
          bg-input-background border-none transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-0
          placeholder:text-muted-foreground
          ${error
            ? 'focus:ring-red-500'
            : 'focus:ring-primary'
          }
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      />
    </div>
  );
};

export default PhoneInput;
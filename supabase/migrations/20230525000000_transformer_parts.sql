-- Update parts table with transformer-specific components
UPDATE parts SET 
  name = 'High Voltage Bushings',
  description = 'Insulated connections that allow high voltage current to enter/exit the transformer',
  specifications = '{"voltage_rating": "230 kV", "material": "Porcelain", "serial_number": "HVB-22931458"}',
  manufacturer = 'ABB'
WHERE part_id = 'P001';

UPDATE parts SET 
  name = 'Load Tap Changer',
  description = 'Device that regulates output voltage by selecting among transformer taps',
  specifications = '{"type": "On-load", "voltage_range": "±10%", "serial_number": "LTC-78456321"}',
  manufacturer = 'Siemens'
WHERE part_id = 'P002';

UPDATE parts SET 
  name = 'Transformer Windings',
  description = 'Primary and secondary conductor coils that transfer energy',
  specifications = '{"material": "Copper", "insulation": "Paper/Oil", "serial_number": "TW-93847561"}',
  manufacturer = 'General Electric'
WHERE part_id = 'P003';

UPDATE parts SET 
  name = 'Cooling System',
  description = 'Oil pumps and fans that maintain transformer operating temperature',
  specifications = '{"cooling_class": "OFAF", "capacity": "100 kW", "serial_number": "CS-45673829"}',
  manufacturer = 'Schneider Electric'
WHERE part_id = 'P004';

UPDATE parts SET 
  name = 'Transformer Core',
  description = 'Laminated steel core that provides magnetic path',
  specifications = '{"material": "Grain-oriented silicon steel", "type": "Shell type", "serial_number": "TC-34298765"}',
  manufacturer = 'Hitachi'
WHERE part_id = 'P005';

UPDATE parts SET 
  name = 'Insulating Oil',
  description = 'Provides electrical insulation and cooling',
  specifications = '{"type": "Mineral oil", "dielectric_strength": "70 kV", "serial_number": "IO-56781234"}',
  manufacturer = 'Shell'
WHERE part_id = 'P006';

UPDATE parts SET 
  name = 'Buchholz Relay',
  description = 'Gas-actuated protective device that detects internal faults',
  specifications = '{"response_time": "50 ms", "sensitivity": "high", "serial_number": "BR-87654321"}',
  manufacturer = 'ABB'
WHERE part_id = 'P007';

UPDATE parts SET 
  name = 'Pressure Relief Device',
  description = 'Safety valve that prevents tank rupture during pressure buildup',
  specifications = '{"pressure_rating": "15 psi", "material": "Stainless steel", "serial_number": "PRD-12398745"}',
  manufacturer = 'Siemens'
WHERE part_id = 'P008';

UPDATE parts SET 
  name = 'Conservator Tank',
  description = 'Expansion tank that accommodates oil volume changes',
  specifications = '{"capacity": "100 gallons", "material": "Carbon steel", "serial_number": "CT-67543219"}',
  manufacturer = 'General Electric'
WHERE part_id = 'P009';

UPDATE parts SET 
  name = 'Temperature Indicators',
  description = 'Monitors oil and winding temperatures',
  specifications = '{"range": "0-150°C", "accuracy": "±1°C", "serial_number": "TI-98761234"}',
  manufacturer = 'Schneider Electric'
WHERE part_id = 'P010';

UPDATE parts SET 
  name = 'Differential Protection Relays',
  description = 'Protection relays that detect internal faults',
  specifications = '{"sensitivity": "0.2 A", "operating_time": "<30 ms", "serial_number": "DPR-54329876"}',
  manufacturer = 'Hitachi'
WHERE part_id = 'P011';

UPDATE parts SET 
  name = 'Surge Arresters',
  description = 'Protect transformer from voltage surges and lightning',
  specifications = '{"voltage_rating": "198 kV", "energy_absorption": "10 kJ/kV", "serial_number": "SA-23456789"}',
  manufacturer = 'ABB'
WHERE part_id = 'P012';

UPDATE parts SET 
  name = 'Tank and Enclosure',
  description = 'Steel structure that contains transformer components',
  specifications = '{"material": "Carbon steel", "coating": "Epoxy paint", "serial_number": "TE-87654390"}',
  manufacturer = 'Siemens'
WHERE part_id = 'P013';

UPDATE parts SET 
  name = 'Radiators',
  description = 'External cooling surfaces that assist in heat dissipation',
  specifications = '{"cooling_capacity": "75 kW", "material": "Galvanized steel", "serial_number": "RAD-45678921"}',
  manufacturer = 'General Electric'
WHERE part_id = 'P014';

UPDATE parts SET 
  name = 'Moisture Absorbers',
  description = 'Silica gel breathers that prevent moisture ingress',
  specifications = '{"type": "Self-regenerating", "capacity": "5 kg", "serial_number": "MA-76543219"}',
  manufacturer = 'Schneider Electric'
WHERE part_id = 'P015'; 
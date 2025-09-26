/**
 * Comprehensive Curriculum Topic Structure
 * Organized by Grade Level → Subject → Sub-Subject → Specific Topics
 */

export interface Topic {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

export interface SubSubject {
  id: string;
  name: string;
  description: string;
  topics: Topic[];
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  subSubjects: SubSubject[];
}

export interface GradeLevelCurriculum {
  gradeLevel: string;
  displayName: string;
  ageRange: string;
  subjects: Subject[];
}

export const CURRICULUM_STRUCTURE: GradeLevelCurriculum[] = [
  // K-2 (Ages 5-8)
  {
    gradeLevel: 'k-2',
    displayName: 'Kindergarten - 2nd Grade',
    ageRange: 'Ages 5-8',
    subjects: [
      {
        id: 'mathematics',
        name: 'Mathematics',
        description: 'Number sense, basic operations, and shapes',
        icon: '🔢',
        subSubjects: [
          {
            id: 'number_sense',
            name: 'Number Sense',
            description: 'Understanding numbers and counting',
            topics: [
              { id: 'counting_1_10', name: 'Counting 1-10', description: 'Basic counting skills', keywords: ['counting', 'numbers', 'one to ten'] },
              { id: 'counting_1_20', name: 'Counting 1-20', description: 'Extended counting', keywords: ['counting', 'numbers', 'twenty'] },
              { id: 'number_recognition', name: 'Number Recognition', description: 'Identifying written numbers', keywords: ['recognize', 'identify', 'numerals'] },
              { id: 'more_less_same', name: 'More, Less, Same', description: 'Comparing quantities', keywords: ['compare', 'more', 'less', 'equal'] },
              { id: 'number_patterns', name: 'Number Patterns', description: 'Simple patterns with numbers', keywords: ['patterns', 'sequence', 'skip counting'] }
            ]
          },
          {
            id: 'basic_operations',
            name: 'Basic Operations',
            description: 'Addition and subtraction fundamentals',
            topics: [
              { id: 'addition_to_10', name: 'Addition to 10', description: 'Basic addition facts', keywords: ['addition', 'plus', 'sum', 'ten'] },
              { id: 'subtraction_from_10', name: 'Subtraction from 10', description: 'Basic subtraction facts', keywords: ['subtraction', 'minus', 'difference'] },
              { id: 'fact_families', name: 'Fact Families', description: 'Related addition and subtraction facts', keywords: ['fact families', 'related facts'] },
              { id: 'word_problems_simple', name: 'Simple Word Problems', description: 'Story problems with pictures', keywords: ['word problems', 'story problems'] }
            ]
          },
          {
            id: 'geometry_shapes',
            name: 'Shapes & Geometry',
            description: 'Basic shapes and spatial concepts',
            topics: [
              { id: 'basic_shapes', name: 'Basic Shapes', description: 'Circle, square, triangle, rectangle', keywords: ['shapes', 'circle', 'square', 'triangle'] },
              { id: 'shape_attributes', name: 'Shape Attributes', description: 'Sides, corners, curves', keywords: ['sides', 'corners', 'vertices', 'curves'] },
              { id: 'spatial_concepts', name: 'Spatial Concepts', description: 'Above, below, next to, inside', keywords: ['position', 'location', 'spatial'] },
              { id: 'patterns_shapes', name: 'Shape Patterns', description: 'Patterns using shapes', keywords: ['patterns', 'shapes', 'sequence'] }
            ]
          },
          {
            id: 'measurement',
            name: 'Measurement',
            description: 'Basic measurement concepts',
            topics: [
              { id: 'length_comparison', name: 'Length Comparison', description: 'Longer, shorter, same length', keywords: ['length', 'longer', 'shorter', 'measure'] },
              { id: 'weight_comparison', name: 'Weight Comparison', description: 'Heavier, lighter, same weight', keywords: ['weight', 'heavy', 'light'] },
              { id: 'time_concepts', name: 'Time Concepts', description: 'Morning, afternoon, night, days', keywords: ['time', 'clock', 'day', 'night'] },
              { id: 'money_recognition', name: 'Money Recognition', description: 'Pennies, nickels, dimes, quarters', keywords: ['money', 'coins', 'penny', 'nickel'] }
            ]
          }
        ]
      },
      {
        id: 'science',
        name: 'Science',
        description: 'Exploring the natural world through observation',
        icon: '🔬',
        subSubjects: [
          {
            id: 'life_science',
            name: 'Life Science',
            description: 'Living things and their needs',
            topics: [
              { id: 'animals_needs', name: 'Animal Needs', description: 'What animals need to survive', keywords: ['animals', 'needs', 'survival', 'habitat'] },
              { id: 'plant_needs', name: 'Plant Needs', description: 'What plants need to grow', keywords: ['plants', 'growth', 'sunlight', 'water'] },
              { id: 'life_cycles', name: 'Simple Life Cycles', description: 'How living things grow and change', keywords: ['life cycle', 'growth', 'baby animals'] },
              { id: 'animal_homes', name: 'Animal Homes', description: 'Where different animals live', keywords: ['habitat', 'homes', 'environment'] }
            ]
          },
          {
            id: 'physical_science',
            name: 'Physical Science',
            description: 'Matter and motion basics',
            topics: [
              { id: 'push_pull', name: 'Push and Pull', description: 'Forces that make things move', keywords: ['force', 'push', 'pull', 'motion'] },
              { id: 'materials_properties', name: 'Material Properties', description: 'Hard, soft, rough, smooth', keywords: ['materials', 'properties', 'texture'] },
              { id: 'sinking_floating', name: 'Sinking and Floating', description: 'What sinks and what floats', keywords: ['sink', 'float', 'water', 'density'] },
              { id: 'magnets', name: 'Magnets', description: 'What magnets attract', keywords: ['magnets', 'attract', 'magnetic'] }
            ]
          },
          {
            id: 'earth_science',
            name: 'Earth Science',
            description: 'Weather, seasons, and Earth',
            topics: [
              { id: 'weather_observation', name: 'Weather Observation', description: 'Sunny, rainy, cloudy, snowy', keywords: ['weather', 'sunny', 'rain', 'snow'] },
              { id: 'seasons', name: 'Seasons', description: 'Spring, summer, fall, winter', keywords: ['seasons', 'spring', 'summer', 'fall', 'winter'] },
              { id: 'day_night', name: 'Day and Night', description: 'Sun and moon, light and dark', keywords: ['day', 'night', 'sun', 'moon'] },
              { id: 'rocks_soil', name: 'Rocks and Soil', description: 'Different types of Earth materials', keywords: ['rocks', 'soil', 'earth', 'materials'] }
            ]
          }
        ]
      },
      {
        id: 'english_language_arts',
        name: 'English Language Arts',
        description: 'Reading, writing, and communication skills',
        icon: '📚',
        subSubjects: [
          {
            id: 'phonics_reading',
            name: 'Phonics & Reading',
            description: 'Letter sounds and early reading',
            topics: [
              { id: 'letter_recognition', name: 'Letter Recognition', description: 'Uppercase and lowercase letters', keywords: ['letters', 'alphabet', 'recognition'] },
              { id: 'letter_sounds', name: 'Letter Sounds', description: 'Phonetic sounds of letters', keywords: ['phonics', 'sounds', 'pronunciation'] },
              { id: 'sight_words', name: 'Sight Words', description: 'Common words to memorize', keywords: ['sight words', 'high frequency', 'reading'] },
              { id: 'simple_sentences', name: 'Simple Sentences', description: 'Reading short sentences', keywords: ['sentences', 'reading', 'comprehension'] }
            ]
          },
          {
            id: 'writing',
            name: 'Writing',
            description: 'Early writing skills',
            topics: [
              { id: 'letter_formation', name: 'Letter Formation', description: 'How to write letters correctly', keywords: ['writing', 'letters', 'formation', 'handwriting'] },
              { id: 'simple_words', name: 'Writing Simple Words', description: 'Spelling and writing basic words', keywords: ['spelling', 'words', 'writing'] },
              { id: 'sentence_writing', name: 'Sentence Writing', description: 'Writing complete thoughts', keywords: ['sentences', 'writing', 'thoughts'] },
              { id: 'storytelling', name: 'Storytelling', description: 'Sharing stories orally and in pictures', keywords: ['stories', 'narrative', 'sharing'] }
            ]
          }
        ]
      },
      {
        id: 'social_studies',
        name: 'Social Studies',
        description: 'Community, family, and basic geography',
        icon: '🌍',
        subSubjects: [
          {
            id: 'community_helpers',
            name: 'Community Helpers',
            description: 'People who help in our community',
            topics: [
              { id: 'helpers_jobs', name: 'Helper Jobs', description: 'Police, firefighters, teachers, doctors', keywords: ['community helpers', 'jobs', 'careers'] },
              { id: 'helper_tools', name: 'Helper Tools', description: 'Tools different helpers use', keywords: ['tools', 'equipment', 'helpers'] },
              { id: 'community_places', name: 'Community Places', description: 'School, library, store, hospital', keywords: ['places', 'community', 'buildings'] }
            ]
          },
          {
            id: 'family_traditions',
            name: 'Family & Traditions',
            description: 'Family structures and celebrations',
            topics: [
              { id: 'family_members', name: 'Family Members', description: 'Different family structures', keywords: ['family', 'relatives', 'relationships'] },
              { id: 'holidays', name: 'Holidays', description: 'Different celebrations and traditions', keywords: ['holidays', 'celebrations', 'traditions'] },
              { id: 'cultural_diversity', name: 'Cultural Diversity', description: 'Different ways people live and celebrate', keywords: ['culture', 'diversity', 'traditions'] }
            ]
          }
        ]
      }
    ]
  },

  // 3-5 (Ages 8-11)
  {
    gradeLevel: '3-5',
    displayName: '3rd - 5th Grade',
    ageRange: 'Ages 8-11',
    subjects: [
      {
        id: 'mathematics',
        name: 'Mathematics',
        description: 'Multi-digit operations, fractions, and geometry',
        icon: '🔢',
        subSubjects: [
          {
            id: 'number_operations',
            name: 'Number & Operations',
            description: 'Multi-digit arithmetic and place value',
            topics: [
              { id: 'place_value_1000', name: 'Place Value to 1000s', description: 'Understanding thousands, hundreds, tens, ones', keywords: ['place value', 'thousands', 'hundreds'] },
              { id: 'multi_digit_addition', name: 'Multi-Digit Addition', description: 'Adding numbers with regrouping', keywords: ['addition', 'regrouping', 'carrying'] },
              { id: 'multi_digit_subtraction', name: 'Multi-Digit Subtraction', description: 'Subtracting with borrowing', keywords: ['subtraction', 'borrowing', 'regrouping'] },
              { id: 'multiplication_facts', name: 'Multiplication Facts', description: 'Times tables 1-12', keywords: ['multiplication', 'times tables', 'facts'] },
              { id: 'division_facts', name: 'Division Facts', description: 'Basic division relationships', keywords: ['division', 'facts', 'quotient'] },
              { id: 'rounding_estimation', name: 'Rounding & Estimation', description: 'Estimating and rounding numbers', keywords: ['rounding', 'estimation', 'approximate'] }
            ]
          },
          {
            id: 'fractions',
            name: 'Fractions',
            description: 'Understanding parts of a whole',
            topics: [
              { id: 'fraction_concepts', name: 'Fraction Concepts', description: 'Parts of a whole, numerator, denominator', keywords: ['fractions', 'parts', 'whole', 'numerator', 'denominator'] },
              { id: 'equivalent_fractions', name: 'Equivalent Fractions', description: 'Fractions that represent the same amount', keywords: ['equivalent', 'equal fractions', 'same value'] },
              { id: 'comparing_fractions', name: 'Comparing Fractions', description: 'Greater than, less than with fractions', keywords: ['compare', 'greater', 'less', 'fractions'] },
              { id: 'adding_fractions', name: 'Adding Fractions', description: 'Adding fractions with like denominators', keywords: ['addition', 'fractions', 'like denominators'] },
              { id: 'subtracting_fractions', name: 'Subtracting Fractions', description: 'Subtracting fractions with like denominators', keywords: ['subtraction', 'fractions', 'like denominators'] },
              { id: 'mixed_numbers', name: 'Mixed Numbers', description: 'Whole numbers and fractions combined', keywords: ['mixed numbers', 'whole', 'fractions'] }
            ]
          },
          {
            id: 'geometry',
            name: 'Geometry',
            description: 'Shapes, angles, and spatial reasoning',
            topics: [
              { id: 'polygons', name: 'Polygons', description: 'Triangles, quadrilaterals, pentagons, hexagons', keywords: ['polygons', 'triangles', 'quadrilaterals'] },
              { id: 'angles', name: 'Angles', description: 'Right angles, acute, obtuse', keywords: ['angles', 'right', 'acute', 'obtuse'] },
              { id: 'symmetry', name: 'Symmetry', description: 'Lines of symmetry in shapes', keywords: ['symmetry', 'reflection', 'mirror'] },
              { id: 'perimeter', name: 'Perimeter', description: 'Distance around shapes', keywords: ['perimeter', 'distance', 'around'] },
              { id: 'area', name: 'Area', description: 'Space inside shapes', keywords: ['area', 'space', 'square units'] },
              { id: 'coordinate_plane', name: 'Coordinate Plane', description: 'Plotting points on a grid', keywords: ['coordinates', 'grid', 'plotting', 'points'] }
            ]
          },
          {
            id: 'measurement_data',
            name: 'Measurement & Data',
            description: 'Units of measure and data analysis',
            topics: [
              { id: 'linear_measurement', name: 'Linear Measurement', description: 'Inches, feet, yards, centimeters, meters', keywords: ['length', 'inches', 'feet', 'centimeters', 'meters'] },
              { id: 'weight_mass', name: 'Weight & Mass', description: 'Pounds, ounces, grams, kilograms', keywords: ['weight', 'mass', 'pounds', 'grams'] },
              { id: 'capacity_volume', name: 'Capacity & Volume', description: 'Cups, pints, quarts, gallons, liters', keywords: ['capacity', 'volume', 'cups', 'liters'] },
              { id: 'time_elapsed', name: 'Elapsed Time', description: 'Calculating time differences', keywords: ['time', 'elapsed', 'duration', 'clock'] },
              { id: 'bar_graphs', name: 'Bar Graphs', description: 'Reading and creating bar graphs', keywords: ['graphs', 'data', 'charts', 'bars'] },
              { id: 'line_plots', name: 'Line Plots', description: 'Displaying data on number lines', keywords: ['line plots', 'data', 'number line'] }
            ]
          }
        ]
      },
      {
        id: 'science',
        name: 'Science',
        description: 'Life cycles, forces, weather, and ecosystems',
        icon: '🔬',
        subSubjects: [
          {
            id: 'life_science',
            name: 'Life Science',
            description: 'Plants, animals, and ecosystems',
            topics: [
              { id: 'plant_life_cycles', name: 'Plant Life Cycles', description: 'Seed to adult plant stages', keywords: ['plants', 'life cycle', 'growth', 'seeds'] },
              { id: 'animal_life_cycles', name: 'Animal Life Cycles', description: 'Birth to adult animal stages', keywords: ['animals', 'life cycle', 'metamorphosis'] },
              { id: 'adaptations', name: 'Animal Adaptations', description: 'How animals survive in their environment', keywords: ['adaptations', 'survival', 'environment'] },
              { id: 'food_chains', name: 'Food Chains', description: 'How energy flows through ecosystems', keywords: ['food chains', 'predator', 'prey', 'ecosystem'] },
              { id: 'habitats', name: 'Habitats', description: 'Where different organisms live', keywords: ['habitats', 'environment', 'biomes'] },
              { id: 'inherited_traits', name: 'Inherited Traits', description: 'Characteristics passed from parents', keywords: ['traits', 'inheritance', 'genetics'] }
            ]
          },
          {
            id: 'physical_science',
            name: 'Physical Science',
            description: 'Forces, motion, and matter',
            topics: [
              { id: 'forces_motion', name: 'Forces & Motion', description: 'Pushes, pulls, and movement', keywords: ['forces', 'motion', 'push', 'pull', 'friction'] },
              { id: 'simple_machines', name: 'Simple Machines', description: 'Levers, pulleys, wheels, inclined planes', keywords: ['machines', 'levers', 'pulleys', 'wheels'] },
              { id: 'states_matter', name: 'States of Matter', description: 'Solid, liquid, gas', keywords: ['matter', 'solid', 'liquid', 'gas', 'states'] },
              { id: 'properties_matter', name: 'Properties of Matter', description: 'Color, texture, hardness, flexibility', keywords: ['properties', 'matter', 'characteristics'] },
              { id: 'heat_temperature', name: 'Heat & Temperature', description: 'How heat affects matter', keywords: ['heat', 'temperature', 'thermal', 'energy'] },
              { id: 'sound_vibrations', name: 'Sound & Vibrations', description: 'How sound is made and travels', keywords: ['sound', 'vibrations', 'waves', 'hearing'] }
            ]
          },
          {
            id: 'earth_science',
            name: 'Earth Science',
            description: 'Weather, climate, and Earth processes',
            topics: [
              { id: 'weather_patterns', name: 'Weather Patterns', description: 'Local and global weather changes', keywords: ['weather', 'patterns', 'climate', 'temperature'] },
              { id: 'water_cycle', name: 'Water Cycle', description: 'Evaporation, condensation, precipitation', keywords: ['water cycle', 'evaporation', 'precipitation'] },
              { id: 'rock_cycle', name: 'Rock Cycle', description: 'How rocks form and change', keywords: ['rocks', 'minerals', 'cycle', 'formation'] },
              { id: 'erosion_weathering', name: 'Erosion & Weathering', description: 'How Earth\'s surface changes', keywords: ['erosion', 'weathering', 'landforms'] },
              { id: 'natural_disasters', name: 'Natural Disasters', description: 'Earthquakes, volcanoes, storms', keywords: ['disasters', 'earthquakes', 'volcanoes', 'storms'] },
              { id: 'natural_resources', name: 'Natural Resources', description: 'Renewable and non-renewable resources', keywords: ['resources', 'renewable', 'conservation'] }
            ]
          },
          {
            id: 'space_science',
            name: 'Space Science',
            description: 'Solar system and space exploration',
            topics: [
              { id: 'solar_system', name: 'Solar System', description: 'Planets, moons, and the sun', keywords: ['solar system', 'planets', 'sun', 'moon'] },
              { id: 'earth_moon_sun', name: 'Earth, Moon & Sun', description: 'Relationship and movements', keywords: ['earth', 'moon', 'sun', 'rotation', 'orbit'] },
              { id: 'phases_moon', name: 'Phases of the Moon', description: 'Why the moon appears to change shape', keywords: ['moon', 'phases', 'lunar', 'cycle'] },
              { id: 'stars_constellations', name: 'Stars & Constellations', description: 'Patterns in the night sky', keywords: ['stars', 'constellations', 'patterns', 'night sky'] }
            ]
          }
        ]
      }
      // Continue with other subjects for 3-5...
    ]
  },

  // 6-8 (Ages 11-14) - Middle School
  {
    gradeLevel: '6-8',
    displayName: '6th - 8th Grade',
    ageRange: 'Ages 11-14',
    subjects: [
      {
        id: 'mathematics',
        name: 'Mathematics',
        description: 'Pre-algebra, ratios, and advanced geometry',
        icon: '🔢',
        subSubjects: [
          {
            id: 'ratios_proportions',
            name: 'Ratios & Proportions',
            description: 'Relationships between quantities',
            topics: [
              { id: 'ratio_concepts', name: 'Ratio Concepts', description: 'Understanding ratios and rates', keywords: ['ratios', 'rates', 'proportions'] },
              { id: 'unit_rates', name: 'Unit Rates', description: 'Rates with denominator of 1', keywords: ['unit rates', 'per unit', 'rates'] },
              { id: 'proportional_relationships', name: 'Proportional Relationships', description: 'Direct and inverse relationships', keywords: ['proportional', 'direct', 'inverse'] },
              { id: 'scale_drawings', name: 'Scale Drawings', description: 'Maps and scaled representations', keywords: ['scale', 'drawings', 'maps', 'blueprints'] },
              { id: 'percent', name: 'Percent', description: 'Percentages and percent change', keywords: ['percent', 'percentage', 'change', 'increase', 'decrease'] }
            ]
          },
          {
            id: 'algebraic_thinking',
            name: 'Algebraic Thinking',
            description: 'Variables, expressions, and equations',
            topics: [
              { id: 'variables_expressions', name: 'Variables & Expressions', description: 'Using letters to represent numbers', keywords: ['variables', 'expressions', 'algebraic'] },
              { id: 'evaluating_expressions', name: 'Evaluating Expressions', description: 'Substituting values for variables', keywords: ['evaluate', 'substitute', 'expressions'] },
              { id: 'writing_expressions', name: 'Writing Expressions', description: 'Translating word problems to algebra', keywords: ['writing', 'expressions', 'word problems'] },
              { id: 'solving_equations', name: 'Solving Equations', description: 'One-step and two-step equations', keywords: ['equations', 'solving', 'one-step', 'two-step'] },
              { id: 'inequalities', name: 'Inequalities', description: 'Greater than, less than relationships', keywords: ['inequalities', 'greater', 'less', 'solutions'] }
            ]
          },
          {
            id: 'geometry_measurement',
            name: 'Geometry & Measurement',
            description: 'Area, volume, and geometric relationships',
            topics: [
              { id: 'area_polygons', name: 'Area of Polygons', description: 'Triangles, parallelograms, trapezoids', keywords: ['area', 'polygons', 'triangles', 'parallelograms'] },
              { id: 'surface_area', name: 'Surface Area', description: 'Area of 3D shapes\' surfaces', keywords: ['surface area', '3D', 'prisms', 'pyramids'] },
              { id: 'volume', name: 'Volume', description: 'Space inside 3D shapes', keywords: ['volume', 'cubic units', 'prisms', 'cylinders'] },
              { id: 'pythagorean_theorem', name: 'Pythagorean Theorem', description: 'Right triangle relationships', keywords: ['pythagorean', 'right triangles', 'hypotenuse'] },
              { id: 'transformations', name: 'Transformations', description: 'Translations, rotations, reflections', keywords: ['transformations', 'translations', 'rotations', 'reflections'] }
            ]
          },
          {
            id: 'statistics_probability',
            name: 'Statistics & Probability',
            description: 'Data analysis and chance',
            topics: [
              { id: 'measures_center', name: 'Measures of Center', description: 'Mean, median, mode', keywords: ['mean', 'median', 'mode', 'average'] },
              { id: 'measures_variability', name: 'Measures of Variability', description: 'Range, interquartile range', keywords: ['range', 'variability', 'spread', 'quartiles'] },
              { id: 'data_displays', name: 'Data Displays', description: 'Box plots, histograms, scatter plots', keywords: ['box plots', 'histograms', 'scatter plots', 'data'] },
              { id: 'probability_concepts', name: 'Probability Concepts', description: 'Likelihood of events', keywords: ['probability', 'chance', 'likelihood', 'events'] },
              { id: 'compound_probability', name: 'Compound Probability', description: 'Multiple events and tree diagrams', keywords: ['compound', 'multiple events', 'tree diagrams'] }
            ]
          }
        ]
      },
      {
        id: 'science',
        name: 'Science',
        description: 'Life science, physical science, and earth science',
        icon: '🔬',
        subSubjects: [
          {
            id: 'life_science',
            name: 'Life Science',
            description: 'Cells, genetics, and evolution',
            topics: [
              { id: 'cell_structure', name: 'Cell Structure & Function', description: 'Plant and animal cells', keywords: ['cells', 'organelles', 'structure', 'function'] },
              { id: 'human_body_systems', name: 'Human Body Systems', description: 'Circulatory, respiratory, digestive systems', keywords: ['body systems', 'organs', 'human anatomy'] },
              { id: 'genetics_heredity', name: 'Genetics & Heredity', description: 'How traits are passed down', keywords: ['genetics', 'heredity', 'DNA', 'traits'] },
              { id: 'evolution_natural_selection', name: 'Evolution & Natural Selection', description: 'How species change over time', keywords: ['evolution', 'natural selection', 'adaptation'] },
              { id: 'ecosystems_interactions', name: 'Ecosystems & Interactions', description: 'Food webs and environmental relationships', keywords: ['ecosystems', 'food webs', 'interactions', 'environment'] },
              { id: 'classification', name: 'Classification of Life', description: 'Organizing living things', keywords: ['classification', 'taxonomy', 'kingdoms', 'species'] }
            ]
          },
          {
            id: 'physical_science',
            name: 'Physical Science',
            description: 'Chemistry and physics concepts',
            topics: [
              { id: 'atomic_structure', name: 'Atomic Structure', description: 'Atoms, elements, and periodic table', keywords: ['atoms', 'elements', 'periodic table', 'protons'] },
              { id: 'chemical_reactions', name: 'Chemical Reactions', description: 'How substances change', keywords: ['chemical reactions', 'compounds', 'molecules'] },
              { id: 'forces_interactions', name: 'Forces & Interactions', description: 'Newton\'s laws and motion', keywords: ['forces', 'motion', 'Newton', 'gravity', 'friction'] },
              { id: 'energy_waves', name: 'Energy & Waves', description: 'Types of energy and wave properties', keywords: ['energy', 'waves', 'sound', 'light', 'electromagnetic'] },
              { id: 'electricity_magnetism', name: 'Electricity & Magnetism', description: 'Electric circuits and magnetic fields', keywords: ['electricity', 'magnetism', 'circuits', 'current'] }
            ]
          },
          {
            id: 'earth_science',
            name: 'Earth Science',
            description: 'Geology, meteorology, and astronomy',
            topics: [
              { id: 'plate_tectonics', name: 'Plate Tectonics', description: 'Earth\'s moving plates and geological features', keywords: ['plate tectonics', 'earthquakes', 'volcanoes', 'continental drift'] },
              { id: 'rock_mineral_cycle', name: 'Rock & Mineral Cycle', description: 'Formation and types of rocks', keywords: ['rocks', 'minerals', 'igneous', 'sedimentary', 'metamorphic'] },
              { id: 'weather_climate', name: 'Weather & Climate', description: 'Atmospheric processes and climate change', keywords: ['weather', 'climate', 'atmosphere', 'greenhouse effect'] },
              { id: 'water_systems', name: 'Water Systems', description: 'Oceans, groundwater, and water cycle', keywords: ['water cycle', 'oceans', 'groundwater', 'watersheds'] },
              { id: 'solar_system_universe', name: 'Solar System & Universe', description: 'Planets, stars, and galaxies', keywords: ['solar system', 'universe', 'stars', 'galaxies', 'astronomy'] }
            ]
          }
        ]
      }
      // Continue with other subjects for 6-8...
    ]
  }

  // Continue with 9-10, 11-12, and adult levels...
];

/**
 * Get all subjects for a specific grade level
 */
export function getSubjectsForGrade(gradeLevel: string): Subject[] {
  const curriculum = CURRICULUM_STRUCTURE.find(c => c.gradeLevel === gradeLevel);
  return curriculum ? curriculum.subjects : [];
}

/**
 * Get all sub-subjects for a specific grade and subject
 */
export function getSubSubjects(gradeLevel: string, subjectId: string): SubSubject[] {
  const subjects = getSubjectsForGrade(gradeLevel);
  const subject = subjects.find(s => s.id === subjectId);
  return subject ? subject.subSubjects : [];
}

/**
 * Get all topics for a specific grade, subject, and sub-subject
 */
export function getTopics(gradeLevel: string, subjectId: string, subSubjectId: string): Topic[] {
  const subSubjects = getSubSubjects(gradeLevel, subjectId);
  const subSubject = subSubjects.find(ss => ss.id === subSubjectId);
  return subSubject ? subSubject.topics : [];
}

/**
 * Search topics across all curriculum
 */
export function searchTopics(query: string, gradeLevel?: string): { topic: Topic; path: string }[] {
  const results: { topic: Topic; path: string }[] = [];
  const searchTerm = query.toLowerCase();
  
  const curriculumToSearch = gradeLevel 
    ? CURRICULUM_STRUCTURE.filter(c => c.gradeLevel === gradeLevel)
    : CURRICULUM_STRUCTURE;

  curriculumToSearch.forEach(curriculum => {
    curriculum.subjects.forEach(subject => {
      subject.subSubjects.forEach(subSubject => {
        subSubject.topics.forEach(topic => {
          const matches = [
            topic.name.toLowerCase().includes(searchTerm),
            topic.description.toLowerCase().includes(searchTerm),
            topic.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
          ].some(Boolean);

          if (matches) {
            results.push({
              topic,
              path: `${curriculum.displayName} > ${subject.name} > ${subSubject.name}`
            });
          }
        });
      });
    });
  });

  return results;
}
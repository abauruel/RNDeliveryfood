import React, { useEffect, useState } from 'react';
import { Image, ScrollView } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { createIconSetFromFontello } from 'react-native-vector-icons';
import Logo from '../../assets/logo-header.png';
import SearchInput from '../../components/SearchInput';

import api from '../../services/api';
import formatValue from '../../utils/formatValue';

import {
  Container,
  Header,
  FilterContainer,
  Title,
  CategoryContainer,
  CategorySlider,
  CategoryItem,
  CategoryItemTitle,
  FoodsContainer,
  FoodList,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
} from './styles';

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  thumbnail_url: string;
  formattedPrice: string;
  category: number;
}

interface Category {
  id: number;
  title: string;
  image_url: string;
}

const Dashboard: React.FC = () => {
  const navigation = useNavigation();
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    number | undefined
  >();
  const [searchValue, setSearchValue] = useState('');

  const { navigate } = useNavigation();

  async function handleNavigate(id: number): Promise<void> {
    // Navigate do ProductDetails page
    navigate('FoodDetails', { id });
  }

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      // Load Foods from API

      if (!selectedCategory && !searchValue) {
        const response = await api.get<Food[]>('foods', {
          params: {
            name_like: '',
          },
        });
        const foodResponse = response.data.map(food => {
          return {
            ...food,
            formattedPrice: formatValue(food.price),
          };
        });

        setFoods(foodResponse);
      }

      if (selectedCategory) {
        const response = await api.get('foods', {
          params: {
            category_like: selectedCategory,
          },
        });
        setFoods(
          response.data.map(food => {
            return {
              ...food,
              formattedPrice: formatValue(food.price),
            };
          }),
        );
      }

      if (searchValue) {
        const response = await api.get('foods', {
          params: {
            name_like: searchValue,
          },
        });
        setFoods(
          response.data.map(food => {
            return {
              ...food,
              formattedPrice: formatValue(food.price),
            };
          }),
        );
      }
    }

    loadFoods();
  }, [selectedCategory, searchValue]);

  useEffect(() => {
    async function loadCategories(): Promise<void> {
      const response = await api.get('categories');

      setCategories(response.data);
    }

    loadCategories();
  }, []);

  useEffect(() => {
    async function loadListFood(): Promise<void> {
      const response = await api.get<Food[]>('foods', {
        params: {
          name_like: '',
        },
      });
      const foodsList = response.data.map<Food>(food => {
        const foodnew = {
          ...food,
          formattedPrice: formatValue(food.price),
        };
        return foodnew;
      });
      setFoods(foodsList);
    }
    loadListFood();
  }, []);
  function handleSelectCategory(id: number): void {
    if (selectedCategory === id) {
      setSelectedCategory(undefined);
    } else {
      setSelectedCategory(id);
    }
  }

  return (
    <Container>
      <Header>
        <Image source={Logo} />
        <Icon
          name="log-out"
          size={24}
          color="#FFB84D"
          onPress={() => navigation.navigate('Home')}
        />
      </Header>
      <FilterContainer>
        <SearchInput
          value={searchValue}
          onChangeText={setSearchValue}
          placeholder="Qual comida você procura?"
        />
      </FilterContainer>
      <ScrollView>
        <CategoryContainer>
          <Title>Categorias</Title>
          <CategorySlider
            contentContainerStyle={{
              paddingHorizontal: 20,
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {categories.map(category => (
              <CategoryItem
                key={category.id}
                isSelected={category.id === selectedCategory}
                onPress={() => handleSelectCategory(category.id)}
                activeOpacity={0.6}
                testID={`category-${category.id}`}
              >
                <Image
                  style={{ width: 56, height: 56 }}
                  source={{ uri: category.image_url }}
                />
                <CategoryItemTitle>{category.title}</CategoryItemTitle>
              </CategoryItem>
            ))}
          </CategorySlider>
        </CategoryContainer>
        <FoodsContainer>
          <Title>Pratos</Title>
          <FoodList>
            {foods &&
              foods.map(food => (
                <Food
                  key={food.id}
                  onPress={() => handleNavigate(food.id)}
                  activeOpacity={0.6}
                  testID={`food-${food.id}`}
                >
                  <FoodImageContainer>
                    <Image
                      style={{ width: 88, height: 88 }}
                      source={{ uri: food.thumbnail_url }}
                    />
                  </FoodImageContainer>
                  <FoodContent>
                    <FoodTitle>{food.name}</FoodTitle>
                    <FoodDescription>{food.description}</FoodDescription>
                    <FoodPricing>{food.formattedPrice}</FoodPricing>
                  </FoodContent>
                </Food>
              ))}
          </FoodList>
        </FoodsContainer>
      </ScrollView>
    </Container>
  );
};

export default Dashboard;

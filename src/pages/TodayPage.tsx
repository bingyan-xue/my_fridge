import { useState } from 'react';
import { MealCard } from '../components/MealCard';
import { completePlannedMealItem, undoCompletedMealItem } from '../domain/inventory';
import { generateMeal, type GenerateMealResult } from '../domain/planner';
import type { AppData, Meal, MealPlan } from '../domain/types';
import type { Translation } from '../i18n/translations';

type TodayPageProps = {
  appData: AppData;
  onChange: (data: AppData) => void;
  t: Translation;
};

const mealTypes: Array<Meal['mealType']> = ['breakfast', 'lunch', 'dinner'];

function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createEmptyMeal(mealType: Meal['mealType']): Meal {
  return { mealType, items: [] };
}

function createMealPlan(date: string, now: string): MealPlan {
  return {
    id: `plan-${crypto.randomUUID()}`,
    date,
    meals: mealTypes.map(createEmptyMeal),
    createdAt: now,
    updatedAt: now,
  };
}

function upsertMeal(plan: MealPlan, meal: Meal, now: string): MealPlan {
  const exists = plan.meals.some((candidate) => candidate.mealType === meal.mealType);
  return {
    ...plan,
    updatedAt: now,
    meals: exists
      ? plan.meals.map((candidate) => (candidate.mealType === meal.mealType ? meal : candidate))
      : [...plan.meals, meal],
  };
}

function mealFailureLabel(result: GenerateMealResult): string | undefined {
  return result.status === 'failed' ? result.reason : undefined;
}

export function TodayPage({ appData, onChange, t }: TodayPageProps) {
  const today = getLocalDateString();
  const todayPlan = appData.mealPlans.find((plan) => plan.date === today);
  const [failures, setFailures] = useState<Partial<Record<Meal['mealType'], string>>>({});

  function saveTodayPlan(plan: MealPlan) {
    const exists = appData.mealPlans.some((candidate) => candidate.id === plan.id);
    onChange({
      ...appData,
      mealPlans: exists ? appData.mealPlans.map((candidate) => (candidate.id === plan.id ? plan : candidate)) : [plan, ...appData.mealPlans],
    });
  }

  function handleGenerate(mealType: Meal['mealType']) {
    const now = new Date().toISOString();
    const plan = todayPlan ?? createMealPlan(today, now);
    const existingMeal = plan.meals.find((meal) => meal.mealType === mealType);
    const result = generateMeal({
      mealType,
      today,
      ingredients: appData.ingredients,
      recipes: appData.recipes,
      existingMeal,
    });

    setFailures((current) => ({ ...current, [mealType]: mealFailureLabel(result) }));
    if (result.status === 'generated') {
      saveTodayPlan(upsertMeal(plan, result.meal, now));
    }
  }

  function handleConfirm(itemId: string) {
    const plan = appData.mealPlans.find((candidate) => candidate.date === today);
    if (!plan) {
      return;
    }
    onChange(completePlannedMealItem(appData, plan.id, itemId, new Date().toISOString()));
  }

  function handleCancel(itemId: string) {
    const plan = appData.mealPlans.find((candidate) => candidate.date === today);
    if (!plan) {
      return;
    }
    onChange(undoCompletedMealItem(appData, plan.id, itemId, new Date().toISOString()));
  }

  return (
    <section className="stackPage">
      <h1>{t.today.title}</h1>
      <p>{t.today.description}</p>
      <div className="mealGrid">
        {mealTypes.map((mealType) => (
          <MealCard
            key={mealType}
            failureReason={failures[mealType] ? t.plannerFailure[failures[mealType] as keyof typeof t.plannerFailure] : undefined}
            meal={todayPlan?.meals.find((meal) => meal.mealType === mealType)}
            mealType={mealType}
            t={t}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            onGenerate={() => handleGenerate(mealType)}
          />
        ))}
      </div>
    </section>
  );
}

import { useState } from 'react';
import { MealCard } from '../components/MealCard';
import { RecipePicker } from '../components/RecipePicker';
import { canCompletePlannedMealItem, completePlannedMealItem, removePlannedMealItem, undoCompletedMealItem } from '../domain/inventory';
import { buildPlannedMealItem, generateMeal, type GenerateMealResult } from '../domain/planner';
import type { AppData, Meal, MealPlan, Recipe } from '../domain/types';
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

function confirmationFailureLabel(reason: 'missingIngredient' | 'insufficientQuantity' | 'unitNeedsConfirmation', t: Translation): string {
  if (reason === 'insufficientQuantity') {
    return t.today.confirmationFailure.insufficientQuantity;
  }
  if (reason === 'unitNeedsConfirmation') {
    return t.today.confirmationFailure.unitNeedsConfirmation;
  }
  return t.today.confirmationFailure.missingIngredient;
}

export function TodayPage({ appData, onChange, t }: TodayPageProps) {
  const today = getLocalDateString();
  const todayPlan = appData.mealPlans.find((plan) => plan.date === today);
  const todayItems = todayPlan?.meals.flatMap((meal) => meal.items) ?? [];
  const plannedItemCount = todayItems.filter((item) => item.status === 'planned').length;
  const completedItemCount = todayItems.filter((item) => item.status === 'completed').length;
  const [failures, setFailures] = useState<Partial<Record<Meal['mealType'], string>>>({});
  const [confirmationFailures, setConfirmationFailures] = useState<Record<string, string>>({});
  const [pickerMealType, setPickerMealType] = useState<Meal['mealType'] | null>(null);

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
    const availability = canCompletePlannedMealItem(appData, plan.id, itemId);
    if (!availability.ok) {
      setConfirmationFailures((current) => ({ ...current, [itemId]: confirmationFailureLabel(availability.reason, t) }));
      return;
    }

    setConfirmationFailures((current) => {
      const next = { ...current };
      delete next[itemId];
      return next;
    });
    onChange(completePlannedMealItem(appData, plan.id, itemId, new Date().toISOString()));
  }

  function handleCancel(itemId: string) {
    const plan = appData.mealPlans.find((candidate) => candidate.date === today);
    if (!plan) {
      return;
    }
    onChange(undoCompletedMealItem(appData, plan.id, itemId, new Date().toISOString()));
  }

  function handleRemove(itemId: string) {
    const plan = appData.mealPlans.find((candidate) => candidate.date === today);
    if (!plan) {
      return;
    }
    setConfirmationFailures((current) => {
      const next = { ...current };
      delete next[itemId];
      return next;
    });
    onChange(removePlannedMealItem(appData, plan.id, itemId, new Date().toISOString()));
  }

  function handleSelectRecipe(recipe: Recipe) {
    if (!pickerMealType) {
      return;
    }

    const now = new Date().toISOString();
    const plan = todayPlan ?? createMealPlan(today, now);
    const meal = plan.meals.find((candidate) => candidate.mealType === pickerMealType) ?? createEmptyMeal(pickerMealType);
    const item = buildPlannedMealItem(recipe, appData.ingredients, today, { allowInsufficientInventory: true });
    if (!item) {
      return;
    }

    saveTodayPlan(upsertMeal(plan, { ...meal, items: [...meal.items, item] }, now));
    setPickerMealType(null);
  }

  return (
    <section className="stackPage">
      <div className="todayHeaderPanel">
        <div>
          <h1>{t.today.title}</h1>
          <p>{today}</p>
        </div>
        <div className="todaySummaryRail" aria-label={t.today.description}>
          <span>{t.today.summary.mealCount(mealTypes.length)}</span>
          <span>{t.today.summary.plannedCount(plannedItemCount)}</span>
          <span>{t.today.summary.doneCount(completedItemCount)}</span>
        </div>
      </div>
      <div className="mealGrid">
        {mealTypes.map((mealType) => (
          <MealCard
            key={mealType}
            failureReason={failures[mealType] ? t.plannerFailure[failures[mealType] as keyof typeof t.plannerFailure] : undefined}
            meal={todayPlan?.meals.find((meal) => meal.mealType === mealType)}
            mealType={mealType}
            confirmationFailures={confirmationFailures}
            t={t}
            onAddRecipe={() => setPickerMealType(mealType)}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            onGenerate={() => handleGenerate(mealType)}
            onRemove={handleRemove}
          />
        ))}
      </div>
      {pickerMealType && (
        <RecipePicker
          ingredients={appData.ingredients}
          mealType={pickerMealType}
          onClose={() => setPickerMealType(null)}
          onSelect={handleSelectRecipe}
          recipes={appData.recipes}
          t={t}
          today={today}
        />
      )}
    </section>
  );
}

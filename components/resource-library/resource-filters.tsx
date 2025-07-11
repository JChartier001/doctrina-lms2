"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  type ResourceType,
  type ResourceCategory,
  getResourceTypes,
  getResourceCategories,
  getResourceTypeDisplayName,
  getCategoryDisplayName,
} from "@/lib/resource-library-service"

export function ResourceFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [resourceTypes, setResourceTypes] = useState<{ type: ResourceType; count: number }[]>([])
  const [resourceCategories, setResourceCategories] = useState<{ category: ResourceCategory; count: number }[]>([])

  // Get current filters from URL
  const selectedTypes = (searchParams.get("type")?.split(",") as ResourceType[]) || []
  const selectedCategories = (searchParams.get("category")?.split(",") as ResourceCategory[]) || []
  const selectedDifficulties = (searchParams.get("difficulty")?.split(",") as string[]) || []

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const types = await getResourceTypes()
        const categories = await getResourceCategories()

        setResourceTypes(types)
        setResourceCategories(categories)
      } catch (error) {
        console.error("Error fetching filters:", error)
      }
    }

    fetchFilters()
  }, [])

  const updateFilters = (
    types: ResourceType[] = selectedTypes,
    categories: ResourceCategory[] = selectedCategories,
    difficulties: string[] = selectedDifficulties,
  ) => {
    const params = new URLSearchParams(searchParams.toString())

    if (types.length > 0) {
      params.set("type", types.join(","))
    } else {
      params.delete("type")
    }

    if (categories.length > 0) {
      params.set("category", categories.join(","))
    } else {
      params.delete("category")
    }

    if (difficulties.length > 0) {
      params.set("difficulty", difficulties.join(","))
    } else {
      params.delete("difficulty")
    }

    router.push(`/resources?${params.toString()}`)
  }

  const handleTypeChange = (type: ResourceType, checked: boolean) => {
    const newTypes = checked ? [...selectedTypes, type] : selectedTypes.filter((t) => t !== type)

    updateFilters(newTypes, selectedCategories, selectedDifficulties)
  }

  const handleCategoryChange = (category: ResourceCategory, checked: boolean) => {
    const newCategories = checked ? [...selectedCategories, category] : selectedCategories.filter((c) => c !== category)

    updateFilters(selectedTypes, newCategories, selectedDifficulties)
  }

  const handleDifficultyChange = (difficulty: string, checked: boolean) => {
    const newDifficulties = checked
      ? [...selectedDifficulties, difficulty]
      : selectedDifficulties.filter((d) => d !== difficulty)

    updateFilters(selectedTypes, selectedCategories, newDifficulties)
  }

  const clearFilters = () => {
    router.push("/resources")
  }

  const hasActiveFilters = selectedTypes.length > 0 || selectedCategories.length > 0 || selectedDifficulties.length > 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        )}
      </div>

      <Separator />

      <Accordion type="multiple" defaultValue={["type", "category", "difficulty"]}>
        <AccordionItem value="type">
          <AccordionTrigger>Resource Type</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {resourceTypes.map(({ type, count }) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={(checked) => handleTypeChange(type, checked === true)}
                  />
                  <Label htmlFor={`type-${type}`} className="flex-1 text-sm cursor-pointer">
                    {getResourceTypeDisplayName(type)}
                  </Label>
                  <span className="text-xs text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="category">
          <AccordionTrigger>Category</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {resourceCategories
                .filter(({ count }) => count > 0)
                .map(({ category, count }) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(checked) => handleCategoryChange(category, checked === true)}
                    />
                    <Label htmlFor={`category-${category}`} className="flex-1 text-sm cursor-pointer">
                      {getCategoryDisplayName(category)}
                    </Label>
                    <span className="text-xs text-muted-foreground">{count}</span>
                  </div>
                ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="difficulty">
          <AccordionTrigger>Difficulty Level</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {["beginner", "intermediate", "advanced"].map((difficulty) => (
                <div key={difficulty} className="flex items-center space-x-2">
                  <Checkbox
                    id={`difficulty-${difficulty}`}
                    checked={selectedDifficulties.includes(difficulty)}
                    onCheckedChange={(checked) => handleDifficultyChange(difficulty, checked === true)}
                  />
                  <Label htmlFor={`difficulty-${difficulty}`} className="text-sm capitalize cursor-pointer">
                    {difficulty}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
